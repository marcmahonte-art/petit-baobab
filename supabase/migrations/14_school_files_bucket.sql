-- Bucket pour les fichiers écoles (logo, documents)
insert into storage.buckets (id, name, public)
values ('school-files', 'school-files', true)
on conflict (id) do nothing;
