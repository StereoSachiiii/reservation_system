import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentApi } from '@/shared/api/documentApi';
import { DocumentResponse } from '@/shared/types/api';

export function useDocuments() {
    const queryClient = useQueryClient();

    const documentsQuery = useQuery({
        queryKey: ['vendor-documents'],
        queryFn: documentApi.getDocuments,
    });

    const deleteMutation = useMutation({
        mutationFn: documentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendor-documents'] });
        },
        onError: () => {
            alert('Failed to delete document');
        }
    });

    const handleUploadSuccess = () => {
        queryClient.invalidateQueries({ queryKey: ['vendor-documents'] });
    };

    const handleDelete = async (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleDownload = async (doc: DocumentResponse) => {
        try {
            const blob = await documentApi.download(doc.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert('Failed to download document');
        }
    };

    return {
        documents: documentsQuery.data || [],
        isLoading: documentsQuery.isLoading,
        isDeleting: deleteMutation.isPending,
        error: documentsQuery.error instanceof Error ? documentsQuery.error.message : null,
        handleUploadSuccess,
        handleDelete,
        handleDownload
    };
}
