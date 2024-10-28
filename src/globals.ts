import { ExecutionContext, IncomingRequestCfProperties, Request } from '@cloudflare/workers-types/2023-07-01/index';

type Req = Request<unknown, IncomingRequestCfProperties<unknown>>;

let REQUEST: Req;
let ENV: Env;
let CTX: ExecutionContext;

export const GLOBALS = {
	request: {
		'setRequest': function(request: Req): void {
			REQUEST = request;
		},
		'getRequest': function(): Req {
			return REQUEST;
		}
	},
	env: {
		'setEnv': function(env: Env): void {
			ENV = env;
		},
		'getEnv': function(): Env {
			return ENV;
		}
	},
	ctx: {
		'setContext': function(ctx: ExecutionContext): void {
			CTX = ctx;
		},
		'getContext': function(): ExecutionContext {
			return CTX;
		}
	}
};
