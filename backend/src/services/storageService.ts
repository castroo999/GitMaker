import path from "path";
import supabase from "../lib/supabase";

export async function enviarArquivo(
    arquivo: Express.Multer.File,
    projetoId: number
) {
    const extensao = path.extname(arquivo.originalname);
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;
    const caminho = `${projetoId}/${nomeArquivo}`;

    const { data, error } = await supabase.storage
        .from("projetos")
        .upload(caminho, arquivo.buffer, {
            contentType: arquivo.mimetype,
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Erro ao enviar arquivo para o Supabase:", error);
        throw new Error("Não foi possível enviar o arquivo");
    }

    const { data: publicUrlData } = supabase.storage
        .from("projetos")
        .getPublicUrl(data.path);

    return {
        path: data.path,
        url: publicUrlData.publicUrl,
    };
}

export async function deletarArquivo(url: string) {
    const marcador = "/storage/v1/object/public/projetos/";

    if (!url.includes(marcador)) {
        return;
    }

    const caminho = url.split(marcador)[1];

    if (!caminho) {
        return;
    }

    const { error } = await supabase.storage
        .from("projetos")
        .remove([caminho]);

    if (error) {
        console.error("Erro ao deletar arquivo do Supabase:", error);
    }
}