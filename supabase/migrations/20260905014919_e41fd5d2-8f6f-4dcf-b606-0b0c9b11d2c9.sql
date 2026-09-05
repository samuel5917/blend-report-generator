CREATE POLICY "Logados leem imagens T2" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'blend-t2');
CREATE POLICY "Logados enviam imagens T2" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blend-t2');
CREATE POLICY "Logados atualizam imagens T2" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'blend-t2') WITH CHECK (bucket_id = 'blend-t2');
CREATE POLICY "Logados excluem imagens T2" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'blend-t2');