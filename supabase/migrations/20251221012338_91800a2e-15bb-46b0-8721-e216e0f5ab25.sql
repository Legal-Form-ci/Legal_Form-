-- Drop existing problematic policies on user_roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

-- Create security definer function to check admin role without recursion
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Create security definer function to check team role without recursion
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'team')
  )
$$;

-- Create new non-recursive RLS policies for user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Also update other tables that reference user_roles to use the new functions
-- Update company_requests policies
DROP POLICY IF EXISTS "Team can view all requests" ON public.company_requests;
DROP POLICY IF EXISTS "Team can update all requests" ON public.company_requests;
DROP POLICY IF EXISTS "Admins can delete requests" ON public.company_requests;

CREATE POLICY "Team can view all requests"
ON public.company_requests
FOR SELECT
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can update all requests"
ON public.company_requests
FOR UPDATE
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can delete requests"
ON public.company_requests
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update service_requests policies
DROP POLICY IF EXISTS "Team can view all service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Team can update service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can delete service requests" ON public.service_requests;

CREATE POLICY "Team can view all service requests"
ON public.service_requests
FOR SELECT
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Team can update service requests"
ON public.service_requests
FOR UPDATE
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can delete service requests"
ON public.service_requests
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Update payments policies
DROP POLICY IF EXISTS "Team can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;

CREATE POLICY "Team can view all payments"
ON public.payments
FOR SELECT
USING (public.is_team_member(auth.uid()));

CREATE POLICY "Admins can manage payments"
ON public.payments
FOR ALL
USING (public.is_admin(auth.uid()));

-- Update profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.is_team_member(auth.uid()));