import { useState } from 'react';
import { ApiError, friendlyError } from '@/shared/api/errors';
import { proposalsApi, requestsApi, servicesApi } from '@/shared/api/endpoints';
import type { Role, Service } from '@/shared/api/types';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';

const DEFAULT_RATING = 5;

/** Everything the service tracking screen shows: the service, its request, the accepted proposal and the review. */
export function useServiceDetail(id: number, role: Role) {
  const isClient = role === 'CLIENT';
  const service = useApiQuery((signal) => servicesApi.get(id, { signal }), [id], { refetchOnFocus: true });
  const status = service.data?.status;
  const requestId = service.data?.requestId;

  const request = useApiQuery((signal) => requestsApi.get(requestId!, { signal }), [requestId], { enabled: requestId !== undefined });
  // Only the owner can list proposals (GET /requests/{id}/proposals), and that is where the visit cost comes from.
  const proposals = useApiQuery((signal) => proposalsApi.list(requestId!, { signal }), [requestId], { enabled: isClient && requestId !== undefined });
  const review = useApiQuery((signal) => servicesApi.review(id, { signal }), [id, status], { enabled: status === 'COMPLETADO' });

  // The status the user just set shows right away, but only until the reload brings the server copy.
  const [override, setOverride] = useState<Service | null>(null);
  const current = service.data && override && override.id === service.data.id && service.loading ? override : service.data;

  // The API answers 404 for "not reviewed yet"; that is a state, not a failure.
  const reviewMissing = review.error instanceof ApiError && review.error.status === 404;
  const canReview = isClient && current?.status === 'COMPLETADO' && reviewMissing;

  const [rating, setRating] = useState(DEFAULT_RATING);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState<string>();
  const [formError, setFormError] = useState('');
  const { busy: submitting, run } = useAsyncAction();

  const submitReview = () =>
    run(async () => {
      const trimmed = comment.trim();
      if (!trimmed) {
        setCommentError('Cuéntale a otros clientes cómo te fue.');
        return;
      }
      setCommentError(undefined);
      setFormError('');
      try {
        await servicesApi.createReview(id, { rating, comment: trimmed });
        review.refetch();
      } catch (cause) {
        setFormError(friendlyError(cause));
        // A 409 means the review already exists (sent twice, or from another device): show it.
        if (cause instanceof ApiError && cause.status === 409) review.refetch();
      }
    });

  return {
    service,
    current,
    request,
    accepted: proposals.data?.find((p) => p.id === current?.proposalId),
    review,
    reviewMissing,
    canReview,
    reviewForm: { rating, setRating, comment, setComment, commentError, formError, submitting, submit: submitReview },
    onStatusChanged: (updated: Service) => {
      setOverride(updated);
      service.refetch();
      review.refetch();
    },
  };
}
