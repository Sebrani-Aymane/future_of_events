#!/bin/bash
cd /workspaces/future_of_events/frontend
npm install 2>&1 | tail -5
echo "=== TypeScript version ==="
node -e "console.log(require('./node_modules/typescript/package.json').version)"
echo "=== supabase-js version ==="
node -e "console.log(require('./node_modules/@supabase/supabase-js/package.json').version)"
echo "=== postgrest-js version ==="
node -e "console.log(require('./node_modules/@supabase/postgrest-js/package.json').version)"
echo "=== Type test ==="
npx tsc --noEmit test-types.ts --target es2017 --strict 2>&1
echo "EXIT_CODE=$?"
