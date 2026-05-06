import {buildClientSchema, IntrospectionQuery, printSchema} from "graphql";
import * as fs from "fs";
import {fetchData} from "./fetchData.js";

(async () => {
    const res = await fetchData({
        loadEnvFiles: process.argv.includes('--load-env-files'),
    })
    await assertOk(res)
    const data = await res.json()
    assertNoGraphQLErrors(data)
    await saveSchema(data)
})()

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
