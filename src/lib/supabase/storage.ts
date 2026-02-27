// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = { storage: any };

export async function uploadMarinaPhoto(
  supabase: AnySupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("marina-photos")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("marina-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteMarinaPhoto(
  supabase: AnySupabaseClient,
  photoUrl: string
): Promise<void> {
  const path = photoUrl.split("/marina-photos/")[1];
  if (path) {
    await supabase.storage.from("marina-photos").remove([path]);
  }
}
