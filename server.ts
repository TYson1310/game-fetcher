import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.NODE_ENV === 'production' && process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

app.use(express.json());

// In-memory cache for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let scratchOffsCache: CacheEntry<any> | null = null;
let winningNumbersCache: CacheEntry<any> | null = null;
const CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache

// Helper to make HTTPS GET requests with headers matching NJ Lottery requirements
function fetchJson<T>(urlStr: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.njlottery.com/en-us/scratch-offs/active.html',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch (err) {
            reject(new Error(`Failed to parse JSON response: ${err}`));
          }
        } else {
          reject(new Error(`HTTP error ${res.statusCode}: ${data.slice(0, 100)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy(new Error('Request timed out'));
    });
    req.end();
  });
}

function padZeros(gameId: string | number): string {
  const str = String(gameId);
  return str.padStart(5, '0');
}

function formatCurrency(amountInCents: number): string {
  const dollars = amountInCents / 100;
  if (dollars >= 1_000_000) {
    const m = dollars / 1_000_000;
    return Number.isInteger(m) ? `$${m} Million` : `$${m.toFixed(1)} Million`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(dollars);
}

// Format Top Prize description or fallback
function getTopPrizeInfo(prizeTiers: any[] = []) {
  if (!prizeTiers || prizeTiers.length === 0) {
    return {
      topPrizeAmount: 0,
      topPrizeFormatted: 'N/A',
      topPrizesTotal: 0,
      topPrizesRemaining: 0,
      topPrizesPaid: 0,
      topPrizesClaimed: 0,
    };
  }

  // Sort prize tiers by prizeAmount descending
  const sorted = [...prizeTiers].sort((a, b) => (b.prizeAmount || 0) - (a.prizeAmount || 0));
  const topTier = sorted[0];

  const prizeAmountInCents = topTier.prizeAmount || 0;
  const prizeAmountDollars = prizeAmountInCents / 100;
  
  // Calculate remaining top prizes using NJ Lottery logic:
  // if prizeAmount >= 60000 (which is $600+), remaining = winningTickets - claimedTickets
  // else remaining = winningTickets - paidTickets
  const winning = topTier.winningTickets || 0;
  const claimed = topTier.claimedTickets || 0;
  const paid = topTier.paidTickets || 0;

  let remaining = 0;
  if (prizeAmountInCents >= 60000) {
    remaining = Math.max(0, winning - claimed);
  } else {
    remaining = Math.max(0, winning - paid);
  }

  const topPrizeFormatted =
    topTier.prizeDescription && topTier.prizeDescription.trim().length > 0
      ? topTier.prizeDescription.trim()
      : formatCurrency(prizeAmountInCents);

  return {
    topPrizeAmount: prizeAmountDollars,
    topPrizeFormatted,
    topPrizesTotal: winning,
    topPrizesRemaining: remaining,
    topPrizesPaid: paid,
    topPrizesClaimed: claimed,
  };
}

// Scratch-Offs endpoint
app.get('/api/scratch-offs', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();

    if (!forceRefresh && scratchOffsCache && now - scratchOffsCache.timestamp < CACHE_TTL) {
      res.json(scratchOffsCache.data);
      return;
    }

    const apiUrl = 'https://www.njlottery.com/api/v1/instant-games/games/?size=1000';
    const rawData = await fetchJson<any>(apiUrl);
    const games = rawData?.games || [];

    // Filter active games per NJ lottery logic:
    // launchDate <= now && (!disableDate || now < (disableDate - 365 * 24 * 60 * 60 * 1000))
    const activeGamesRaw = games.filter((g: any) => {
      const launch = g.launchDate || 0;
      const disable = g.disableDate;
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      return launch <= now && (!disable || now < disable - oneYearMs);
    });

    // Transform and normalize games
    const transformed = activeGamesRaw.map((g: any) => {
      const paddedId = padZeros(g.gameId);
      const priceDollars = (g.ticketPrice || 0) / 100;
      const topPrizeInfo = getTopPrizeInfo(g.prizeTiers);

      // Process tiers
      const sortedTiers = [...(g.prizeTiers || [])]
        .sort((a, b) => (b.prizeAmount || 0) - (a.prizeAmount || 0))
        .map((t) => {
          const amt = t.prizeAmount || 0;
          const win = t.winningTickets || 0;
          const clm = t.claimedTickets || 0;
          const pd = t.paidTickets || 0;
          const rem = amt >= 60000 ? Math.max(0, win - clm) : Math.max(0, win - pd);

          return {
            tierNumber: t.tierNumber,
            prizeDescription: t.prizeDescription || formatCurrency(amt),
            prizeAmount: amt / 100,
            winningTickets: win,
            claimedTickets: clm,
            paidTickets: pd,
            remainingTickets: rem,
          };
        });

      let totalRemainingPrizes = 0;
      let totalWinningPrizes = 0;
      for (const t of sortedTiers) {
        totalRemainingPrizes += t.remainingTickets;
        totalWinningPrizes += t.winningTickets;
      }

      return {
        gameId: String(g.gameId),
        gameNumber: `#${paddedId}`,
        gameName: g.gameName,
        price: priceDollars,
        formattedPrice: `$${priceDollars}`,
        topPrize: topPrizeInfo.topPrizeFormatted,
        topPrizeAmount: topPrizeInfo.topPrizeAmount,
        topPrizesRemaining: topPrizeInfo.topPrizesRemaining,
        topPrizesTotal: topPrizeInfo.topPrizesTotal,
        topPrizesPercentRemaining:
          topPrizeInfo.topPrizesTotal > 0
            ? Math.round((topPrizeInfo.topPrizesRemaining / topPrizeInfo.topPrizesTotal) * 100)
            : 0,
        totalRemainingPrizes,
        totalWinningPrizes,
        launchDate: g.launchDate,
        launchDateFormatted: g.launchDate ? new Date(g.launchDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) : 'Recent',
        imageUrl: `https://www.njlottery.com/content/dam/portal/images/instant-games/${paddedId}/thumb-rc.png`,
        imageUrl2x: `https://www.njlottery.com/content/dam/portal/images/instant-games/${paddedId}/thumb-rc@2X.png`,
        detailsUrl: `https://www.njlottery.com/en-us/scratch-offs/${paddedId}.html`,
        prizeTiers: sortedTiers,
      };
    });

    // Default sort by launchDate descending (newest first)
    transformed.sort((a: any, b: any) => (b.launchDate || 0) - (a.launchDate || 0));

    const result = {
      totalGames: transformed.length,
      lastUpdated: new Date().toISOString(),
      games: transformed,
    };

    scratchOffsCache = { data: result, timestamp: now };
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching scratch-offs:', error);
    if (scratchOffsCache) {
      res.json({ ...scratchOffsCache.data, fromStaleCache: true, error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch scratch-off games', details: error.message });
  }
});

// Winning numbers endpoint
app.get('/api/winning-numbers', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.refresh === 'true';
    const now = Date.now();

    if (!forceRefresh && winningNumbersCache && now - winningNumbersCache.timestamp < CACHE_TTL) {
      res.json(winningNumbersCache.data);
      return;
    }

    const apiUrl = 'https://www.njlottery.com/api/v2/draw-games/draws/';
    const rawData = await fetchJson<any>(apiUrl);
    const draws = rawData?.draws || [];

    // Group draws by gameName
    // Map open draws for jackpots and next draw times
    const openDrawsByGame = new Map<string, any>();
    for (const d of draws) {
      if (d.status === 'OPEN' && !openDrawsByGame.has(d.gameName)) {
        openDrawsByGame.set(d.gameName, d);
      }
    }

    // Filter closed draws with results
    const closedDraws = draws.filter(
      (d: any) => d.status === 'CLOSED' && d.results && d.results.length > 0
    );

    // Pick latest draw per game
    const latestDrawByGame = new Map<string, any>();
    for (const d of closedDraws) {
      const existing = latestDrawByGame.get(d.gameName);
      if (!existing || d.drawTime > existing.drawTime) {
        latestDrawByGame.set(d.gameName, d);
      }
    }

    // Parse and standardize winning game data
    const parsedGames: any[] = [];

    // Game display configurations & priorities
    const gameConfig: Record<string, { priority: number; displayName: string; color: string }> = {
      Powerball: { priority: 1, displayName: 'Powerball', color: '#e53e3e' },
      'Mega Millions': { priority: 2, displayName: 'Mega Millions', color: '#3182ce' },
      'Cash 5': { priority: 3, displayName: 'Jersey Cash 5', color: '#2f855a' },
      'Pick 6': { priority: 4, displayName: 'Pick-6 with Double Play', color: '#805ad5' },
      'Cash 4 Life': { priority: 5, displayName: 'Cash4Life', color: '#0d9488' },
      'Pick 4': { priority: 6, displayName: 'Pick-4 with FIREBALL', color: '#d97706' },
      'Pick 3': { priority: 7, displayName: 'Pick-3 with FIREBALL', color: '#ea580c' },
      KENO: { priority: 8, displayName: 'Quick Draw (Keno)', color: '#4f46e5' },
      CASHPOP: { priority: 9, displayName: 'Cash POP', color: '#db2777' },
      'Xs and Os': { priority: 10, displayName: 'Xs and Os', color: '#4b5563' },
    };

    latestDrawByGame.forEach((draw, gameName) => {
      const openDraw = openDrawsByGame.get(gameName);
      const conf = gameConfig[gameName] || {
        priority: 99,
        displayName: gameName,
        color: '#4b5563',
      };

      let estimatedJackpot = 0;
      let estimatedJackpotFormatted = '';
      if (openDraw && openDraw.estimatedJackpot) {
        estimatedJackpot = openDraw.estimatedJackpot / 100;
        estimatedJackpotFormatted = formatCurrency(openDraw.estimatedJackpot);
      } else if (gameName === 'Cash 4 Life') {
        estimatedJackpotFormatted = '$1,000 / Day for Life';
      }

      // Parse results
      let primaryBalls: string[] = [];
      let specialBall: { label: string; number: string; type: string } | null = null;
      let multiplier: string | number | null = null;
      let fireball: string | null = null;
      let doublePlay: { primary: string[]; specialBall?: string } | null = null;

      // Extract results based on game type
      const regularResult = draw.results.find((r: any) => r.drawType === 'Regular') || draw.results[0];
      const dpResult = draw.results.find((r: any) => r.drawType === 'Double Play');
      const fbResult = draw.results.find((r: any) => r.drawType === 'FIREBALL');

      if (regularResult && regularResult.primary) {
        // Look through primary items
        for (const item of regularResult.primary) {
          if (item.startsWith('PB-')) {
            specialBall = { label: 'Powerball', number: String(parseInt(item.replace('PB-', ''), 10)), type: 'powerball' };
          } else if (item.startsWith('MB-')) {
            specialBall = { label: 'Mega Ball', number: String(parseInt(item.replace('MB-', ''), 10)), type: 'megaball' };
          } else if (item.startsWith('CB-')) {
            specialBall = { label: 'Cash Ball', number: String(parseInt(item.replace('CB-', ''), 10)), type: 'cashball' };
          } else if (item.startsWith('B-')) {
            specialBall = { label: 'Bullseye', number: String(parseInt(item.replace('B-', ''), 10)), type: 'bullseye' };
          } else if (item.startsWith('M-')) {
            const multVal = parseInt(item.replace('M-', ''), 10);
            if (multVal > 0) multiplier = `${multVal}X`;
          } else {
            // Check if string contains multiple digits like Pick 3 or Pick 4 (e.g. "352" or "6207")
            if (gameName === 'Pick 3' || gameName === 'Pick 4') {
              primaryBalls = item.split('');
            } else {
              primaryBalls.push(String(parseInt(item, 10)));
            }
          }
        }

        if (regularResult.multiplier && !multiplier && regularResult.multiplier > 0) {
          multiplier = `${regularResult.multiplier}X`;
        }
      }

      // Check FIREBALL for Pick 3 / Pick 4
      if (fbResult && fbResult.primary) {
        for (const item of fbResult.primary) {
          if (item.startsWith('FB-')) {
            fireball = item.replace('FB-', '');
          }
        }
      }

      // Check Double Play
      if (dpResult && dpResult.primary) {
        const dpBalls: string[] = [];
        let dpSpecial = '';
        for (const item of dpResult.primary) {
          if (item.startsWith('PB-')) {
            dpSpecial = String(parseInt(item.replace('PB-', ''), 10));
          } else if (item.startsWith('M-')) {
            // ignore
          } else {
            dpBalls.push(String(parseInt(item, 10)));
          }
        }
        doublePlay = { primary: dpBalls, specialBall: dpSpecial || undefined };
      }

      const uniqueId = `${gameName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${draw.id}`;

      parsedGames.push({
        id: uniqueId,
        gameName,
        displayName: conf.displayName,
        color: conf.color,
        priority: conf.priority,
        drawDate: new Date(draw.drawTime).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        drawTime: draw.drawTime,
        status: draw.status,
        winningNumbers: {
          primary: primaryBalls,
          specialBall,
          multiplier,
          fireball,
          doublePlay,
        },
        estimatedJackpot,
        estimatedJackpotFormatted,
        nextDrawTime: openDraw ? openDraw.drawTime : null,
        nextDrawFormatted: openDraw
          ? new Date(openDraw.drawTime).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })
          : null,
      });
    });

    parsedGames.sort((a, b) => a.priority - b.priority);

    const result = {
      lastUpdated: new Date().toISOString(),
      games: parsedGames,
    };

    winningNumbersCache = { data: result, timestamp: now };
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching winning numbers:', error);
    if (winningNumbersCache) {
      res.json({ ...winningNumbersCache.data, fromStaleCache: true, error: error.message });
      return;
    }
    res.status(500).json({ error: 'Failed to fetch winning numbers', details: error.message });
  }
});

// Image proxy for ticket pictures
app.get('/api/image-proxy', (req: Request, res: Response) => {
  const urlParam = req.query.url as string;
  if (!urlParam || !urlParam.startsWith('https://www.njlottery.com/')) {
    res.status(400).send('Invalid image URL');
    return;
  }

  const parsedUrl = new URL(urlParam);
  const options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Referer: 'https://www.njlottery.com/en-us/scratch-offs/active.html',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    if (proxyRes.statusCode === 200) {
      res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
      proxyRes.pipe(res);
    } else {
      res.status(proxyRes.statusCode || 404).send('Image not found');
    }
  });

  proxyReq.on('error', (err) => {
    res.status(500).send(`Proxy error: ${err.message}`);
  });

  proxyReq.end();
});

// Mount Vite or static serving
async function initServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Server initialization error:', err);
  process.exit(1);
});
