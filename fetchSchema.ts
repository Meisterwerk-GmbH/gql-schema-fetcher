import {buildClientSchema, getIntrospectionQuery, IntrospectionQuery, printSchema} from "graphql";
import * as fs from "fs";
import {loadEnv} from "vite";

(async () => {
    const res = await fetchData()
    await assertOk(res)
    const data = await res.json()
    assertNoGraphQLErrors(data)
    await saveSchema(data)
})()

async function fetchData() {
    const env = loadEnv('dev', process.cwd())
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
    return await fetch(`${env.VITE_HTTP_ENDPOINT}/api/graphql`, {
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

async function assertOk(res: Response) {
    if (!res.ok) {
        const body = await res.text()
        console.error('HTTP error', res.status, res.statusText)
        console.error(body)
        process.exit(1)
    }
}

function assertNoGraphQLErrors(data: {errors?: unknown[]}) {
    if (data.errors?.length) {
        console.error('GraphQL errors:')
        for (const err of data.errors) {
            console.error(JSON.stringify(err, null, 2))
        }
        process.exit(1)
    }
}

async function saveSchema(data: {data?: IntrospectionQuery}) {
    if ('data' in data && data.data) {
        const schema = printSchema(buildClientSchema(data.data))
        const schemaDir = process.env.SCHEMA_DIR ?? 'src/graphql'
        if (schema) fs.writeFileSync(`${schemaDir}/schema.graphql`, schema)
    } else {
        console.error('Unexpected response:', data)
        process.exit(1)
    }
}