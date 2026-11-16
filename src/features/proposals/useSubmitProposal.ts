import { useMemo, useState } from 'react';
import { ApiError, friendlyError } from '@/shared/api/errors';
import { proposalsApi } from '@/shared/api/endpoints';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction';
import { parseCost, scheduleDays, validateProposal, type ProposalErrors } from './proposalForm';

function submitErrorMessage(cause: unknown): string {
  if (cause instanceof ApiError && cause.status === 409) return 'Ya enviaste una propuesta a este caso o el cliente ya cerró la solicitud.';
  if (cause instanceof ApiError && cause.status === 403) return 'Este caso ya no es compatible con tu perfil o tu zona de atención.';
  return friendlyError(cause);
}

/** Form state and submission of a technician's proposal for one request. Sends at most once per tap. */
export function useSubmitProposal(requestId: number) {
  const days = useMemo(() => scheduleDays(new Date()), []);
  const [cost, setCost] = useState('');
  const [dayOffset, setDayOffset] = useState(1);
  const [hour, setHour] = useState(10);
  const [conditions, setConditions] = useState('');
  const [errors, setErrors] = useState<ProposalErrors>({});
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);
  const { busy, run } = useAsyncAction();

  const submit = () =>
    run(async () => {
      const { errors: next, body } = validateProposal({ cost, day: days[dayOffset]!, hour, conditions });
      setErrors(next);
      setFormError('');
      if (!body) return;
      try {
        await proposalsApi.submit(requestId, body);
        setSent(true);
      } catch (cause) {
        setFormError(submitErrorMessage(cause));
      }
    });

  const preview = parseCost(cost);
  return {
    days,
    cost,
    setCost,
    dayOffset,
    setDayOffset,
    hour,
    setHour,
    conditions,
    setConditions,
    errors,
    formError,
    sent,
    busy,
    submit,
    /** What the client will see, once the typed cost is valid. */
    costPreview: Number.isFinite(preview) && preview >= 0 ? preview : null,
  };
}
