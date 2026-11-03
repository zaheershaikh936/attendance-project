-- Create Company Admin Function
-- This function allows company owners to create an admin role for themselves or designated employees

-- Enable security extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT EXECUTE ON FUNCTION supabase_functions.create_company_admin TO "authenticated";

-- Function implementation (for reference when deploying)
/*

CREATE OR REPLACE FUNCTION supabase_functions.create_company_admin(
  company_id UUID,
  user_id UUID,
  admin_name TEXT DEFAULT 'admin'
) RETURNS BOOLEAN AS $$
DECLARE
  v_company_record RECORD;
  v_user_exists boolean := false;
BEGIN
    -- Verify company exists
    SELECT EXISTS (SELECT 1 FROM companies WHERE id = company_id) INTO v_company_record;

    IF NOT v_company_record THEN
      RAISE EXCEPTION 'Company does not exist';
    END IF;

    -- Check if user already has admin role in this company
    SELECT EXISTS (
        SELECT 1 FROM employees e
        JOIN companies c ON c.id = e.company_id
        WHERE c.id = company_id
        AND e.id = user_id
        AND e.role = 'admin'
    ) INTO v_user_exists;

    IF v_user_exists THEN
      RAISE NOTICE 'User already has admin role in this company';
      RETURN true;
    END IF;

    -- Check if user exists (or create new user record)
    SELECT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) INTO v_user_exists;

    IF NOT v_user_exists THEN
      RAISE EXCEPTION 'User does not exist, please register first';
    END IF;

    -- Update employee role to admin
    UPDATE employees e
    SET role = 'admin'
    WHERE e.id = user_id
    AND e.company_id = company_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rollback function (for reference)
CREATE OR REPLACE FUNCTION supabase_functions.remove_company_admin(
  company_id UUID,
  user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE employees e
    SET role = 'employee'
    WHERE e.id = user_id
    AND e.company_id = company_id;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

*/
