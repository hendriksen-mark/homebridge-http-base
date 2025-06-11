import { UrlObject } from './configparser';
import async = require('async');
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import {AsyncFunction} from 'async';
import { setTimeout } from 'timers';
import * as http from 'http';
import * as ip from 'ip';

const delayPattern = /^delay\(\d+\)*$/;
const numberPattern = /\d+/;

export class ExecutionStrategy {
  static PARALLEL = async.parallel;
  static SERIES = async.series;

  static get(name: string) {
    name = name.toUpperCase();
    switch (name) {
      case 'PARALLEL':
        return this.PARALLEL;
      case 'SERIES':
        return this.SERIES;
      default:
        return null;
    }
  }

}

export type ErrorResponseObject = {
    error?: Error
}

export type ResponseObject = {
    response: AxiosResponse,
    body: string
}

export type BodyReplacer = {
    searchValue: string,
    replacer: string,
}

let multipleUrlExecutionStrategy: any = ExecutionStrategy.PARALLEL;

export function setMultipleUrlExecutionStrategy(strategyString: string) {
  const strategy = ExecutionStrategy.get(strategyString);

  if (strategy) {
    multipleUrlExecutionStrategy = strategy;
    return true;
  }
  return false;
}

export function isHttpSuccessCode(statusCode: number) {
  return Math.floor(statusCode / 100) === 2;
}

export function isHttpRedirectCode(statusCode: number) {
  return Math.floor(statusCode / 100) === 3;
}

export function httpRequest(urlObject: UrlObject, ...bodyReplacer: BodyReplacer[]) {
  let url = urlObject.url;
  let body = urlObject.body;
  let auth: { username: string, password: string } | undefined = undefined;

  if (urlObject.auth && urlObject.auth.username && urlObject.auth.password) {
    auth = {
      username: urlObject.auth.username,
      password: urlObject.auth.password,
    };
  }

  bodyReplacer.forEach(replacer => {
    url = url.replace(replacer.searchValue, replacer.replacer);
    if (body) {
      body = body.replace(replacer.searchValue, replacer.replacer);
    }
  });

  const axiosOptions: AxiosRequestConfig = {
    url,
    method: urlObject.method || 'GET',
    headers: urlObject.headers,
    auth: auth,
    timeout: urlObject.requestTimeout || 20000,
    data: body,
  };

  return axios(axiosOptions);
}

export function multipleHttpRequests(urlObjectArray: UrlObject[]) {
  if (urlObjectArray.length === 0) {
    throw new Error('Empty urlObject array');
  }

  const taskArray: AsyncFunction<AxiosResponse, Error>[] = []; //Array<AsyncFunction<T, E>
  const executionCounter = [];

  for (let i = 0; i < urlObjectArray.length; i++) {
    const urlObject = urlObjectArray[i];

    if (executionCounter[i] === undefined) {
      executionCounter[i] = urlObject.repeat;
    }

    taskArray.push((callback: () => void, delayed?: boolean) => {
      if (urlObject.url.startsWith('delay') && delayPattern.test(urlObject.url)) {
        if (multipleUrlExecutionStrategy !== ExecutionStrategy.SERIES) {
          // Delay method specified but execution is unaffected because of unsuitable execution strategy.
          callback();
          return;
        }

        const delay = parseInt(urlObject.url.match(numberPattern)![0]);

        // execute callback from async framework => finish urlObject
        setTimeout(() => callback(), delay);
        return;
      }

      if (!delayed && urlObject.delayBeforeExecution > 0) {
        const self = arguments.callee;
        // execute the current method a second time though delayed=true
        setTimeout(() => self(callback, true), urlObject.delayBeforeExecution);
        return;
      }

      httpRequest(urlObject);
    });

    executionCounter[i]--;
    if (executionCounter[i] > 0) {
      i--;
    } // repeat current urlObject
  }

  // (err?: E | null, results?: Array<T | undefined>): void;
  // Array<(callback: (err: null, result: {error?: E, value?: T})

  // result: export interface AsyncResultArrayCallback<T, E = Error> { (err?: E | null, results?: Array<T | undefined>): void; }
  multipleUrlExecutionStrategy(async.reflectAll(taskArray), (error: Error | null | undefined, results?: any) => {
    const callbackArray: (ErrorResponseObject | ResponseObject)[] = [];

    for (let i = 0; i < results.length; i++) {
      const element = results[i];

      if (element.error) {
        callbackArray.push({
          error: element.error,
        });
      } else if (element.value) {
        callbackArray.push({
          response: element.value[0],
          body: element.value[1],
        });
      }
    }

    return callbackArray;
  });
}

/**
 * Creates an HTTP server using Node's http.createServer.
 * @param requestListener The request handler function (request, response) => void
 * @returns http.Server instance
 */
export function createHttpServer(requestListener: (req: http.IncomingMessage, res: http.ServerResponse) => void): http.Server {
  return http.createServer(requestListener);
}

/**
 * Returns the local IP address using the 'ip' package.
 */
export function getLocalIpAddress(): string {
  return ip.address();
}
