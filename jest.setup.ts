// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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
  const Response = jest.requireActual('next/server').NextResponse;

  class MockNextResponse extends Response {
    static json(body: any, init?: ResponseInit) {
      const response = new MockNextResponse(
        JSON.stringify(body),
        {
          ...init,
          headers: {
            ...init?.headers,
            'content-type': 'application/json',
          },
        }
      );
      response.status = init?.status || 200;
      response.json = async () => body;
      return response;
    }
  }

  return {
    ...originalModule,
    NextResponse: MockNextResponse,
    NextRequest: jest.fn().mockImplementation((input: string | URL, init = {}) => {
      const url = typeof input === 'string' ? new URL(input) : input;
      return {
        url: url.toString(),
        method: init.method || 'GET',
        headers: new Headers(init.headers),
        json: async () => init.body ? JSON.parse(init.body as string) : null,
        nextUrl: url,
        ...init,
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