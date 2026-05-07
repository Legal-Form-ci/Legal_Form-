-- 1) Buckets nécessaires pour documents & témoignages
insert into storage.buckets (id, name, public)
values
  ('company-documents', 'company-documents', true),
  ('identity-documents', 'identity-documents', false),
  ('testimonial-photos', 'testimonial-photos', true)
on conflict (id) do update set public = excluded.public;

-- 2) Policies storage (reset contrôlé)
drop policy if exists "Anyone can view company documents" on storage.objects;
drop policy if exists "Authenticated can upload company documents" on storage.objects;
drop policy if exists "Authenticated can update company documents" on storage.objects;
drop policy if exists "Authenticated can delete company documents" on storage.objects;

create policy "Anyone can view company documents"
on storage.objects
for select
using (bucket_id = 'company-documents');

create policy "Authenticated can upload company documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'company-documents');

create policy "Authenticated can update company documents"
on storage.objects
for update
to authenticated
using (bucket_id = 'company-documents');

create policy "Authenticated can delete company documents"
on storage.objects
for delete
to authenticated
using (bucket_id = 'company-documents');


drop policy if exists "Authenticated can view identity documents" on storage.objects;
drop policy if exists "Authenticated can upload identity documents" on storage.objects;
drop policy if exists "Authenticated can update identity documents" on storage.objects;
drop policy if exists "Authenticated can delete identity documents" on storage.objects;

create policy "Authenticated can view identity documents"
on storage.objects
for select
to authenticated
using (bucket_id = 'identity-documents');

create policy "Authenticated can upload identity documents"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'identity-documents');

create policy "Authenticated can update identity documents"
on storage.objects
for update
to authenticated
using (bucket_id = 'identity-documents');

create policy "Authenticated can delete identity documents"
on storage.objects
for delete
to authenticated
using (bucket_id = 'identity-documents');


drop policy if exists "Anyone can view testimonial photos" on storage.objects;
drop policy if exists "Anyone can upload testimonial photos" on storage.objects;

create policy "Anyone can view testimonial photos"
on storage.objects
for select
using (bucket_id = 'testimonial-photos');

create policy "Anyone can upload testimonial photos"
on storage.objects
for insert
with check (bucket_id = 'testimonial-photos');

-- 3) Modération des témoignages
alter table public.created_companies
  add column if not exists testimonial_status text not null default 'pending',
  add column if not exists rejection_reason text,
  add column if not exists reviewed_at timestamp with time zone;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'created_companies_testimonial_status_check'
  ) then
    alter table public.created_companies
      add constraint created_companies_testimonial_status_check
      check (testimonial_status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

update public.created_companies
set testimonial_status = case when coalesce(is_visible, false) then 'approved' else 'pending' end,
    reviewed_at = case when coalesce(is_visible, false) then coalesce(reviewed_at, now()) else reviewed_at end
where testimonial_status is null or testimonial_status not in ('pending', 'approved', 'rejected');

-- 4) RLS messagerie interne (admin <-> client via demandes)
drop policy if exists "Users can view messages of own requests" on public.request_messages;
drop policy if exists "Users can send messages" on public.request_messages;

create policy "Users can view messages of own requests"
on public.request_messages
for select
to authenticated
using (
  is_admin_or_team(auth.uid())
  or auth.uid() = sender_id
  or (
    request_type = 'company'
    and exists (
      select 1
      from public.company_requests cr
      where cr.id = request_messages.request_id
        and cr.user_id = auth.uid()
    )
  )
  or (
    request_type = 'service'
    and exists (
      select 1
      from public.service_requests sr
      where sr.id = request_messages.request_id
        and sr.user_id = auth.uid()
    )
  )
);

create policy "Users can send messages"
on public.request_messages
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and (
    is_admin_or_team(auth.uid())
    or (
      sender_role = 'client'
      and (
        (
          request_type = 'company'
          and exists (
            select 1
            from public.company_requests cr
            where cr.id = request_messages.request_id
              and cr.user_id = auth.uid()
          )
        )
        or (
          request_type = 'service'
          and exists (
            select 1
            from public.service_requests sr
            where sr.id = request_messages.request_id
              and sr.user_id = auth.uid()
          )
        )
      )
    )
  )
);

-- 5) RLS échange fichiers de demande (admin/client)
drop policy if exists "Users can view own doc exchanges" on public.request_documents_exchange;
drop policy if exists "Users can upload docs" on public.request_documents_exchange;

create policy "Users can view own doc exchanges"
on public.request_documents_exchange
for select
to authenticated
using (
  is_admin_or_team(auth.uid())
  or auth.uid() = uploaded_by
  or (
    request_type = 'company'
    and exists (
      select 1
      from public.company_requests cr
      where cr.id = request_documents_exchange.request_id
        and cr.user_id = auth.uid()
    )
  )
  or (
    request_type = 'service'
    and exists (
      select 1
      from public.service_requests sr
      where sr.id = request_documents_exchange.request_id
        and sr.user_id = auth.uid()
    )
  )
);

create policy "Users can upload docs"
on public.request_documents_exchange
for insert
to authenticated
with check (
  auth.uid() = uploaded_by
  and (
    is_admin_or_team(auth.uid())
    or (
      request_type = 'company'
      and exists (
        select 1
        from public.company_requests cr
        where cr.id = request_documents_exchange.request_id
          and cr.user_id = auth.uid()
      )
    )
    or (
      request_type = 'service'
      and exists (
        select 1
        from public.service_requests sr
        where sr.id = request_documents_exchange.request_id
          and sr.user_id = auth.uid()
      )
    )
  )
);