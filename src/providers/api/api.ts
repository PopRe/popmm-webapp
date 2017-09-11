import {Injectable} from "@angular/core";
import {Headers, Http} from "@angular/http";
import "rxjs/Rx";

@Injectable()
export class ApiProvider {

    public constructor(private _http: Http) {

    }

    /**
     * Send a GET request to the API.
     *
     * @param {string} endpoint Endpoint to send request to.
     * @param {Object} [data] - Data to send in query parameter.
     * @returns {Promise<{}>} Promise resolve or reject function.
     */
    public get(endpoint: string,
               data: {} = {}): Promise<{}> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}>) => void,
                            reject: (reason?: Error) => void): void => {
            this._http.get(
                endpoint + ApiProvider._dataObjectToQueryString(data),
                {
                    headers: ApiProvider.setRequestHeaders([])
                }
            ).subscribe(
                (res: any) => {
                    let data: any = res.json();
                    resolve(data);
                },
                (err: any) => ApiProvider.handleError(
                    err.status,
                    err,
                    reject
                )
            );
        });
    }

    /**
     * Send a POST request to the API.
     *
     * @param {string} endpoint Endpoint to send request to.
     * @param {Object} data Data to post.
     * @returns {Promise<{}>} Promise resolve or reject function.
     */
    public post(endpoint: string,
                data: Object): Promise<{}> {
        return new Promise((resolve: (value?: {} | PromiseLike<{}>) => void, reject: (reason?: Error) => void): void => {
            this._http.post(
                endpoint,
                ApiProvider._postDataObjectToPostBody(data),
                {
                    headers: ApiProvider.setRequestHeaders([])
                }
            ).subscribe(
                (data: any) => {
                    resolve(data);
                },
                (err: any) => ApiProvider.handleError(
                    err.status,
                    err.json(),
                    reject
                )
            );
        });
    }

    /**
     * Handles an error response from the API.
     *
     * @param {number} status_code HTTP status code.
     * @param {object} err The data object directly from the API response.
     * @param {function} reject Promise reject function.
     */
    private static handleError(status_code: number,
                               err: any,
                               reject: (reason?: Error) => void): void {
        if(status_code === 401) {
            reject(new Error('An error occurred'));
        } else if(status_code === 0) {
            reject(new Error('Server is not responding'));
        }

        reject(new Error(err.error_msg || 'An error occured'));
    }

    /**
     * Set some required headers for the next request and allow adding custom ones.
     *
     * @param {array} [additional_headers] - Array of objects, each with a header name and header value
     * @return {Headers} Headers to use in request.
     */
    private static setRequestHeaders(additional_headers: Array<Object>): Headers {
        let headers: Headers = new Headers();

        headers.append('Content-Type', 'application/x-www-form-urlencoded');

        // Add any custom headers
        for(let i: number = 0; i < additional_headers.length; i++) {
            if(headers.hasOwnProperty(i)) {
                let header: {name: string, value: string} = headers[i];

                if(header.hasOwnProperty('name') && header.hasOwnProperty('value')) {
                    headers.append(header.name, header.value);
                }
            }
        }

        return headers;
    }

    /**
     * Takes an object with key/value pairs and joins them into a POST body string (key=value&key2=value).
     *
     * @param {Object} data The post data as an object.
     * @returns {string} A post body string.
     */
    private static _postDataObjectToPostBody(data: Object): string {
        let parts: Array<string> = [];

        for(let i in data) {
            if(data.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
            }
        }

        return parts.join('&');
    }

    /**
     * Takes an object with key/value pairs and joins them into a query string ready to append to a URL.
     *
     * @param {Object} data
     * @returns {string}
     */
    private static _dataObjectToQueryString(data: Object): string {
        if(Object.keys(data).length > 0) {
            return '?' + ApiProvider._postDataObjectToPostBody(data);
        } else {
            return '';
        }
    }
}
