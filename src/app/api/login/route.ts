// ZITADEL Session API v2 Login Implementation
//
// This implements the official ZITADEL Session API v2 flow for username/password authentication:
// 1. POST /v2/sessions - Create session with user check (validates username)
// 2. PATCH /v2/sessions/{sessionId} - Update session with password check (validates password)
//
// Requirements:
// - Service user with Session API permissions in ZITADEL
// - Environment variables in .env.local:
//   ZITADEL_ISSUER=https://your-instance.zitadel.cloud (without trailing slash)
//   ZITADEL_KEY_JSON='{"type":"serviceaccount","keyId":"your_key_id","key":"-----BEGIN RSA PRIVATE KEY-----\\nMIIEpAIBAAKCAQEA...","userId":"your_user_id"}' (escape newlines in the key)
//   SESSION_SECRET=your-session-secret (for JWT signing)
// - Install jsonwebtoken: npm install jsonwebtoken
//
// This follows the exact flow documented at:
// https://zitadel.com/docs/guides/integrate/login-ui/username-password#request
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ZITADEL_ISSUER = process.env.ZITADEL_ISSUER;
const ZITADEL_KEY_JSON = process.env.ZITADEL_KEY_JSON;
// New (provide these in .env.local):
// ZITADEL_PROJECT_ID=336126908624278328
// ZITADEL_APP_ID=336126999355462456 (optional, narrows audience to a specific app)
const ZITADEL_PROJECT_ID = process.env.ZITADEL_PROJECT_ID;
const ZITADEL_APP_ID = process.env.ZITADEL_APP_ID; // optional
// system | project | app (default system because session API examples use system audience 'zitadel')
const ZITADEL_SESSION_AUDIENCE_MODE =
  process.env.ZITADEL_SESSION_AUDIENCE_MODE || 'system';
const ZITADEL_ADD_OFFLINE_ACCESS =
  (process.env.ZITADEL_ADD_OFFLINE_ACCESS || 'false').toLowerCase() === 'true';

function buildScope(): string {
  const base = ['openid', 'profile', 'email'];
  if (ZITADEL_ADD_OFFLINE_ACCESS) base.push('offline_access');

  const audience: string[] = [];
  switch (ZITADEL_SESSION_AUDIENCE_MODE) {
    case 'app':
      if (ZITADEL_PROJECT_ID && ZITADEL_APP_ID) {
        audience.push(
          `urn:zitadel:iam:org:project:app:id:${ZITADEL_PROJECT_ID}:${ZITADEL_APP_ID}:aud`,
        );
      } else {
        throw new Error(
          'Audience mode app requires ZITADEL_PROJECT_ID and ZITADEL_APP_ID',
        );
      }
      break;
    case 'project':
      if (ZITADEL_PROJECT_ID) {
        audience.push(
          `urn:zitadel:iam:org:project:id:${ZITADEL_PROJECT_ID}:aud`,
        );
      } else {
        throw new Error('Audience mode project requires ZITADEL_PROJECT_ID');
      }
      break;
    case 'system':
    default:
      audience.push('urn:zitadel:iam:org:project:id:zitadel:aud');
      break;
  }

  return [...base, ...audience].join(' ');
}

async function getAccessToken() {
  if (!ZITADEL_KEY_JSON) {
    throw new Error('ZITADEL_KEY_JSON not set');
  }

  // Debug: log presence (not values) of critical env vars
  console.log('[zitadel] env presence', {
    issuer: !!ZITADEL_ISSUER,
    projectId: ZITADEL_PROJECT_ID || '(missing)',
    appId: ZITADEL_APP_ID || '(none)',
    audienceMode: ZITADEL_SESSION_AUDIENCE_MODE,
    offlineAccess: ZITADEL_ADD_OFFLINE_ACCESS,
  });

  const keyData = JSON.parse(ZITADEL_KEY_JSON);
  const userId = keyData.userId;
  const keyId = keyData.keyId;
  const privateKey = keyData.key;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: userId,
    sub: userId,
    aud: ZITADEL_ISSUER,
    iat: now,
    exp: now + 300, // 5 minutes
  };

  const signedJwt = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    keyid: keyId,
  });

  if (!ZITADEL_ISSUER) {
    throw new Error('ZITADEL_ISSUER not set');
  }

  const scope = buildScope();
  console.log('[zitadel] requesting token with scope:', scope);

  const tokenResponse = await fetch(`${ZITADEL_ISSUER}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      scope,
      assertion: signedJwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token request failed:', tokenResponse.status, errorText);
    console.error('[zitadel] token request details:', {
      url: `${ZITADEL_ISSUER}/oauth/v2/token`,
      userId,
      keyId,
      aud: ZITADEL_ISSUER,
      scope,
      projectId: ZITADEL_PROJECT_ID,
      appId: ZITADEL_APP_ID,
    });

    throw new Error(`Failed to get access token: ${tokenResponse.status}`);
  }

  const tokenResponseJson = await tokenResponse.json();
  const { access_token } = tokenResponseJson;
  try {
    const decoded: unknown = jwt.decode(access_token);
    if (decoded && typeof decoded === 'object') {
  const aud = (decoded as Record<string, unknown>)['aud'];
  const scopeClaim = (decoded as Record<string, unknown>)['scope'];
      const iat = (decoded as Record<string, unknown>)['iat'];
      const exp = (decoded as Record<string, unknown>)['exp'];
  console.log('[zitadel] access token decoded', { aud, scope: scopeClaim, lifetimeSeconds: (typeof exp === 'number' && typeof iat === 'number') ? exp - iat : undefined });
    }
  } catch (e) {
    console.warn('[zitadel] failed to decode access token', e);
  }
  return access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { loginName, password } = await req.json();

    if (!loginName || !password) {
      return NextResponse.json(
        { error: 'Missing loginName or password' },
        { status: 400 },
      );
    }

    const accessToken = await getAccessToken();

    console.log(
      '11111111111111111111111111111111111111111111111111111111111111111111111111',
    );
    console.log('Access Token:', accessToken);

    // Step 1: Create Session with User Check (as per ZITADEL docs)
    const createSessionResponse = await fetch(`${ZITADEL_ISSUER}/v2/sessions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checks: {
          user: {
            loginName: loginName,
          },
        },
      }),
    });

    if (!createSessionResponse.ok) {
      const errorText = await createSessionResponse.text();
      console.error(
        'Create session failed:',
        createSessionResponse.status,
        errorText,
      );

      // Parse error for better user feedback
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.message?.includes('user not found')) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 },
          );
        }
      } catch {
        // Keep default error handling
      }

      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 401 },
      );
    }

    const sessionData = await createSessionResponse.json();
    const { sessionId } = sessionData;

    console.log('Session created with ID:', sessionId);

    // Step 2: Update Session with Password Check (as per ZITADEL docs)
    const updateSessionResponse = await fetch(
      `${ZITADEL_ISSUER}/v2/sessions/${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`, // Use access token for auth
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checks: {
            password: {
              password: password,
            },
          },
        }),
      },
    );

    if (!updateSessionResponse.ok) {
      const errorText = await updateSessionResponse.text();
      console.error(
        'Password check failed:',
        updateSessionResponse.status,
        errorText,
      );

      // Parse error for better user feedback
      try {
        const errorData = JSON.parse(errorText);
        if (
          errorData.message?.includes('invalid password') ||
          errorData.message?.includes('password check failed')
        ) {
          return NextResponse.json(
            { error: 'Invalid password' },
            { status: 401 },
          );
        }
      } catch {
        // Keep default error handling
      }

      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 },
      );
    }

    const updatedSessionData = await updateSessionResponse.json();
    const finalSessionToken = updatedSessionData.sessionToken;

    console.log('Password validated successfully');

    // Get session details to extract user information
    const getSessionResponse = await fetch(
      `${ZITADEL_ISSUER}/v2/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`, // Use access token for auth
        },
      },
    );

    if (!getSessionResponse.ok) {
      console.error('Failed to get session details');
      return NextResponse.json(
        { error: 'Failed to get user details' },
        { status: 500 },
      );
    }

    const sessionDetails = await getSessionResponse.json();
    const userInfo = sessionDetails.session.factors.user;

    // Create our application JWT token with ZITADEL session info
    const appSessionData = {
      userId: userInfo.id,
      username: userInfo.loginName,
      displayName: userInfo.displayName,
      loginTime: Date.now(),
      authMethod: 'zitadel_session_api',
      zitadelSessionId: sessionId,
      zitadelSessionToken: finalSessionToken,
    };

    // Sign our application session token
    const appSessionToken = jwt.sign(
      appSessionData,
      process.env.SESSION_SECRET || 'fallback-secret',
      {
        expiresIn: '1h',
        issuer: 'your-app',
        audience: 'your-app-users',
      },
    );

    return NextResponse.json({
      success: true,
      sessionToken: appSessionToken,
      user: {
        id: userInfo.id,
        username: userInfo.loginName,
        displayName: userInfo.displayName,
      },
      zitadelSession: {
        sessionId: sessionId,
        sessionToken: finalSessionToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
