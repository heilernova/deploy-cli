import axios from "axios";
import { AxiosResponse } from "axios";
import { IServer } from "../interfaces/server.interface.js";
import { stopSpinner } from "../utils/spinner.js";

type Method = 'GET' | 'POST' | 'DELETE' | 'PATCH';
type Body = { [key:string]: any } | FormData;

export class HttpClient {
    public static server(server: IServer): HttpClient {
        return new HttpClient(server);
    }

    private _server?: IServer;

    constructor(server?: IServer){
        if (server){
            this._server = server;
        }
    }


    private send<R = any>(url: string, method: Method, body?: Body, headers?: { [key: string]: string }) {
        return new Promise<AxiosResponse<R, any>>((resolve, reject) => {
            if (this._server){
                url = `${this._server.url}/api/${url}`;
                headers = {
                    "x-app-token": this._server.token
                }
            }
            axios({ url, method, headers, data: body  })
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                if (err.response){
                    reject(err.response);
                } else if (err.request){
                    stopSpinner(`No hubo respuesta del servidor ${method} ${url}`, '✘');
                    process.exit();
                } else {
                    stopSpinner('Error al preparar la solicitud HTTP', '✘');
                    process.exit(1);
                }
            })
        })
    }

    public post<R = any>(url: string, body: Body, headers?: { [key: string]: string }): Promise<AxiosResponse<R, any>>{
        return this.send<R>(url, 'POST', body, headers);
    }
    
    public get<R = any>(url: string): Promise<AxiosResponse<R, any>> {
        return this.send<R>(url, 'GET');
    }
}