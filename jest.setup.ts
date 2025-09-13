// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

(global as any).TextEncoder = TextEncoder as any;
(global as any).TextDecoder = TextDecoder as any;

export class MockResponse {
  private statusCode: number = 200;
  private responseBody: any = null;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: any) {
    this.responseBody = data;
    return {
      status: this.statusCode,
      json: async () => this.responseBody,
      text: async () => JSON.stringify(this.responseBody),
    };
  }
}

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => null),
}));

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');

  class MockNextResponse {
    static json(body: any, init?: ResponseInit) {
      const response = new (global as any).Response(JSON.stringify(body), {
        ...init,
        headers: {
          ...init?.headers,
          'content-type': 'application/json',
        },
      });
      (response as any).status = init?.status || 200;
      (response as any).json = async () => body;
      return response as any;
    }
  }

  return {
    ...originalModule,
    NextResponse: MockNextResponse,
    NextRequest: jest.fn().mockImplementation((input: string | URL, init = {}) => {
      const url = typeof input === 'string' ? new URL(input) : input;
      return {
        url: url.toString(),
        method: (init as any).method || 'GET',
        headers: new Headers((init as any).headers),
        json: async () => ((init as any).body ? JSON.parse((init as any).body as string) : null),
        nextUrl: url,
        ...(init as any),
      };
    }),
  };
});

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock Request and Response for Next.js middleware tests
if (typeof global.Request === 'undefined') {
  global.Request = class Request implements Partial<Request> {
    public url: string;

    constructor(input: string | URL | Request, init: RequestInit = {}) {
      this.url = input.toString();
      Object.assign(this, init);
    }
  } as unknown as typeof Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response implements Partial<Response> {
    public body: BodyInit | null;

    constructor(body?: BodyInit | null, init: ResponseInit = {}) {
      this.body = body || null;
      Object.assign(this, init);
    }
  } as unknown as typeof Response;
}
