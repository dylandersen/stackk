const https = require('https');
const fs = require('fs');
const path = require('path');

// Map service names to simpleicons slugs
const serviceMap = {
  'Cursor': 'cursor',
  'GitHub Copilot': 'github',
  'Replit': 'replit',
  'Windsurf': 'codeium', // Codeium is the closest
  'JetBrains': 'jetbrains',
  'Zed': 'zed', // May not exist, will try
  'Bolt.new': 'bolt', // May not exist
  'Claude Pro': 'anthropic',
  'ChatGPT Plus': 'openai',
  'OpenAI API': 'openai',
  'Anthropic API': 'anthropic',
  'Vercel': 'vercel',
  'Railway': 'railway',
  'Render': 'render',
  'Cloudflare': 'cloudflare',
  'Supabase': 'supabase',
  'Convex': 'convex', // May not exist
  'PlanetScale': 'planetscale',
  'Neon': 'neon', // May not exist
  'Firebase': 'firebase',
  'Stripe': 'stripe',
  'Clerk': 'clerk', // May not exist
  'Resend': 'resend', // May not exist
  'v0.dev': 'vercel', // Use vercel as fallback
  'Inngest': 'inngest', // May not exist
  'Lovable': 'lovable', // May not exist
  'Sentry': 'sentry',
  'PostHog': 'posthog',
  'Linear': 'linear',
  'Notion': 'notion',
  'Figma': 'figma',
  'Excalidraw': 'excalidraw', // May not exist
  'tldraw': 'tldraw', // May not exist
  'Lemon Squeezy': 'lemonsqueezy', // May not exist
  'Paddle': 'paddle',
  'Plausible': 'plausible',
  'Fathom': 'fathom', // May not exist
  'Upstash': 'upstash',
  'Turso': 'turso', // May not exist
  'Drizzle': 'drizzle', // May not exist
  'WorkOS': 'workos', // May not exist
  'Loops': 'loops', // May not exist
  'Customer.io': 'customerio',
  'Crisp': 'crisp', // May not exist
  'Better Stack': 'betterstack', // May not exist
  'Doppler': 'doppler', // May not exist
  'Raycast': 'raycast',
  'Arc Browser': 'arc', // May not exist
  'Warp': 'warp', // May not exist
  'Namecheap': 'namecheap',
  'Porkbun': 'porkbun', // May not exist
  'Apple Developer Program': 'apple',
  'Google Play Developer': 'googleplay',
  'GitHub Pro': 'github',
  'GitLab': 'gitlab',
  'Bitbucket': 'bitbucket',
  'Docker Desktop': 'docker',
  'Expo': 'expo',
  'RevenueCat': 'revenuecat', // May not exist
  'TestFlight': 'testflight', // May not exist
  'Firebase App Distribution': 'firebase',
  'Fastlane': 'fastlane', // May not exist
  'Codemagic': 'codemagic', // May not exist
  'Bitrise': 'bitrise', // May not exist
  'App Radar': 'appradar', // May not exist
  'Appfigures': 'appfigures', // May not exist
  'ngrok': 'ngrok',
  'LocalTunnel': 'localtunnel', // May not exist
  'Postman': 'postman',
  'Insomnia': 'insomnia',
  'TablePlus': 'tableplus', // May not exist
  'Proxyman': 'proxyman', // May not exist
  'Charles Proxy': 'charlesproxy', // May not exist
  '1Password': '1password',
  'Setapp': 'setapp', // May not exist
  'CleanShot X': 'cleanshot', // May not exist
};

const logosDir = path.join(__dirname, '../public/logos');

// Ensure directory exists
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

function downloadLogo(slug, filename) {
  return new Promise((resolve, reject) => {
    const url = `https://cdn.simpleicons.org/${slug}`;
    const filePath = path.join(logosDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`✓ ${filename} already exists`);
      resolve();
      return;
    }

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filePath);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          console.log(`✓ Downloaded ${filename}`);
          resolve();
        });
      } else {
        console.log(`✗ Failed to download ${filename} (${response.statusCode})`);
        resolve(); // Don't reject, just skip
      }
    }).on('error', (err) => {
      console.log(`✗ Error downloading ${filename}: ${err.message}`);
      resolve(); // Don't reject, just skip
    });
  });
}

async function fetchAllLogos() {
  console.log('Fetching logos from simpleicons.org...\n');
  
  const promises = Object.entries(serviceMap).map(([serviceName, slug]) => {
    // Create filename from service name (lowercase, replace spaces with dashes)
    const filename = serviceName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/\./g, '')
      .replace(/\+/g, 'plus')
      + '.svg';
    
    return downloadLogo(slug, filename);
  });

  await Promise.all(promises);
  console.log('\nDone!');
}

fetchAllLogos().catch(console.error);
