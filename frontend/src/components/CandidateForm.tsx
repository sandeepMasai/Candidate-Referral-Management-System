import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { CandidateFormPayload } from '../types';

type CandidateFormProps = {
  onSubmit: (payload: CandidateFormPayload) => Promise<void>;
  isSubmitting: boolean;
};

const emptyForm: CandidateFormPayload = {
  name: '',
  email: '',
  phone: '',
  jobTitle: '',
  resume: null,
};

const CandidateForm = ({ onSubmit, isSubmitting }: CandidateFormProps) => {
  const [form, setForm] = useState<CandidateFormPayload>(emptyForm);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setForm((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(emptyForm);
    event.currentTarget.reset();
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="card-header">
        <div>
          <p className="eyebrow">New referral</p>
          <h2>Refer a candidate</h2>
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit referral'}
        </button>
      </div>

      <div className="grid two-cols">
        <label>
          <span>Full name</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="jane@acme.com"
            required
          />
        </label>
      </div>

      <div className="grid two-cols">
        <label>
          <span>Phone</span>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+1 222 333 4444"
            required
          />
        </label>

        <label>
          <span>Role</span>
          <input
            name="jobTitle"
            value={form.jobTitle}
            onChange={handleChange}
            placeholder="Senior Frontend Engineer"
            required
          />
        </label>
      </div>

      <label className="file-input">
        <span>Resume (PDF, optional)</span>
        <input
          type="file"
          name="resume"
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </label>
    </form>
  );
};

export default CandidateForm;

