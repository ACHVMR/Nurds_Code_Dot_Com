import asyncio
import asyncpg
import os

async def test_query():
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://deploy_admin:deploy_dev_password_secure_2025@localhost:5432/deploy_platform"
    )
    print(f"Connecting to: {db_url.replace('deploy_dev_password_secure_2025', '***')}")
    
    conn = await asyncpg.connect(db_url)
    try:
        # First, check table schema
        schema = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'charter_log'
            ORDER BY ordinal_position
        """)
        print(f'\nCharter_log schema:')
        for col in schema:
            print(f'  - {col["column_name"]}: {col["data_type"]}')
        
        # Check if table has any data
        count = await conn.fetchval('SELECT COUNT(*) FROM charter_log')
        print(f'\nTotal rows in charter_log: {count}')
        
        # Check ledger_log schema
        ledger_schema = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ledger_log'
            ORDER BY ordinal_position
        """)
        print(f'\nLedger_log schema:')
        for col in ledger_schema:
            print(f'  - {col["column_name"]}: {col["data_type"]}')
        
    except Exception as e:
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
    finally:
        await conn.close()

asyncio.run(test_query())
