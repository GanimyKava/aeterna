type Config = {
  useMock: boolean;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  apis: {
    simSwap: string;
    locationRetrieval: string;
    populationDensity: string;
    qosProfiles: string;
    qualityOnDemand: string;
  };
  sampleResponsesUrl: string;
  mockDelayMs: number;
};

type SampleResponses = Record<string, unknown> & {
  token?: Record<string, unknown>;
};

const DEFAULT_CONFIG: Config = {
  useMock: true,
  tokenUrl: "https://operator.example.com/oauth2/token",
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  apis: {
    simSwap: "https://operator.example.com/sim-swap/v0/check",
    locationRetrieval: "https://operator.example.com/location-retrieval/v0/retrieve",
    populationDensity: "https://operator.example.com/population-density-data/v0/query",
    qosProfiles: "https://operator.example.com/qos-profiles/v0/profiles",
    qualityOnDemand: "https://operator.example.com/quality-on-demand/v0/sessions",
  },
  sampleResponsesUrl: "/data/camaraSampleResponses.json",
  mockDelayMs: 40,
};

let config: Config = { ...DEFAULT_CONFIG };
let cachedSampleResponses: Promise<SampleResponses> | null = null;

function setConfig(overrides: Partial<Config>) {
  config = {
    ...config,
    ...overrides,
    apis: {
      ...config.apis,
      ...(overrides.apis ?? {}),
    },
  };
}

function loadSampleResponses(): Promise<SampleResponses> {
  if (!cachedSampleResponses) {
    cachedSampleResponses = fetch(config.sampleResponsesUrl).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load sample responses (${res.status})`);
      }
      return res.json();
    });
  }
  return cachedSampleResponses;
}

function buildCorrelator(): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const randomSegment = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `aeterna-${timestamp}-${randomSegment}`;
}

async function obtainAccessToken(scopes?: string | string[]) {
  if (config.useMock) {
    const sample = await loadSampleResponses();
    return {
      ...(sample.token as Record<string, unknown>),
      scope: Array.isArray(scopes) ? scopes.join(" ") : scopes ?? "",
    };
  }

  const scopeParam = Array.isArray(scopes) ? scopes.join(" ") : scopes;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });
  if (scopeParam) {
    body.append("scope", scopeParam);
  }

  const credentials = `${config.clientId}:${config.clientSecret}`;
  const authHeader =
    typeof btoa === "function" ? `Basic ${btoa(credentials)}` : `Basic ${Buffer.from(credentials).toString("base64")}`;

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status}`);
  }

  return response.json();
}

async function callApi<T>({
  method,
  url,
  body,
  scope,
  mockKey,
}: {
  method: "GET" | "POST";
  url: string;
  body?: unknown;
  scope: string;
  mockKey: keyof SampleResponses;
}): Promise<T> {
  if (config.useMock) {
    const sample = await loadSampleResponses();
    const payload = sample[mockKey];
    if (!payload) {
      throw new Error(`Sample response missing for key: ${String(mockKey)}`);
    }
    const cloned = typeof structuredClone === "function" ? (structuredClone(payload) as T) : (JSON.parse(JSON.stringify(payload)) as T);
    const delay = Math.max(0, config.mockDelayMs);
    if (delay === 0) {
      return cloned;
    }
    return new Promise<T>((resolve) => {
      setTimeout(() => resolve(cloned), delay);
    });
  }

  const token = await obtainAccessToken(scope);
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(token as { access_token?: string }).access_token ?? ""}`,
      "x-correlator": buildCorrelator(),
      "x-consent-token": "user-consent-jwt",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API call failed (${url}): ${response.status}`);
  }

  return response.json();
}

function checkSimSwap(phoneNumber: string, options: { maxAge?: { unit: string; amount: number } } = {}) {
  return callApi({
    method: "POST",
    url: config.apis.simSwap,
    scope: "sim-swap",
    mockKey: "simSwap",
    body: { phoneNumber, maxAge: options.maxAge ?? { unit: "DAY", amount: 3 } },
  });
}

function retrieveLocation(phoneNumber: string, options: { requestedAccuracy?: { horizontal: number } } = {}) {
  return callApi({
    method: "POST",
    url: config.apis.locationRetrieval,
    scope: "location-retrieval",
    mockKey: "locationRetrieval",
    body: { phoneNumber, requestedAccuracy: options.requestedAccuracy ?? { horizontal: 750 } },
  });
}

function queryPopulationDensity(area: unknown, options: Record<string, unknown> = {}) {
  return callApi({
    method: "POST",
    url: config.apis.populationDensity,
    scope: "population-density-data",
    mockKey: "populationDensity",
    body: { area, ...options },
  });
}

function listQosProfiles() {
  return callApi({
    method: "GET",
    url: config.apis.qosProfiles,
    scope: "qos-profiles",
    mockKey: "qosProfiles",
  });
}

function requestQualityOnDemand(phoneNumber: string, profileId: string, options: Record<string, unknown> = {}) {
  return callApi({
    method: "POST",
    url: config.apis.qualityOnDemand,
    scope: "quality-on-demand",
    mockKey: "qualityOnDemand",
    body: {
      phoneNumber,
      profileId,
      duration: { amount: 30, unit: "MINUTE" },
      applicationServer: { ipv4: "203.0.113.24", port: 443 },
      ...options,
    },
  });
}

export function registerCamaraApi(): void {
  window.CamaraApi = {
    setConfig,
    obtainAccessToken,
    checkSimSwap,
    retrieveLocation,
    queryPopulationDensity,
    listQosProfiles,
    requestQualityOnDemand,
  };
}

