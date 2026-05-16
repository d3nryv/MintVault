-- Change transactions.sale_id foreign key to ON DELETE CASCADE
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_sale_id_fkey;
ALTER TABLE transactions ADD CONSTRAINT transactions_sale_id_fkey 
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE;
