import {getIntrospectionQuery} from "graphql";
import {loadEnv} from "vite";

export async function fetchData(options: {loadEnvFiles?: boolean} = {}) {
    const env = options.loadEnvFiles ? loadEnv('dev', process.cwd()) : process.env
    const httpEndpoint = env.VITE_HTTP_ENDPOINT ?? env.HTTP_ENDPOINT
    if (!httpEndpoint) {
        console.error('Missing HTTP endpoint. Set HTTP_ENDPOINT or run with --load-env-files to read VITE_HTTP_ENDPOINT from Vite env files.')
        process.exit(1)
    }
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    return fetchEndpoint(httpEndpoint, env.HTTP_SCHEMA_PATH ?? '/api/graphql');
}

async function fetchEndpoint(httpEndpoint: string, schemaPath: string) {
    return await fetch(`${httpEndpoint}${schemaPath}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-AUTH-TOKEN': 'very-secret-token',
        },
        body: JSON.stringify({
            query: getIntrospectionQuery(),
        })
    })
}
