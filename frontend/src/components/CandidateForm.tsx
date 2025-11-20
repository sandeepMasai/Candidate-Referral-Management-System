import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import type { CandidateFormPayload } from '../types';

type CandidateFormProps = {
  onSubmit: (payload: CandidateFormPayload) => Promise<void>;
  isSubmitting: boolean;
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const emptyForm: CandidateFormPayload = {
  name: '',
  email: '',
  phone: '',
  jobTitle: '',
  resume: null,
};

const CandidateForm = ({ onSubmit, isSubmitting }: CandidateFormProps) => {
  const [form, setForm] = useState<CandidateFormPayload>(emptyForm);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFileError(null);

    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setFileError('Only PDF files are allowed');
        setForm((prev) => ({ ...prev, resume: null }));
        event.target.value = '';
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFileError(`File size must be less than ${MAX_FILE_SIZE_MB}MB`);
        setForm((prev) => ({ ...prev, resume: null }));
        event.target.value = '';
        return;
      }

      setForm((prev) => ({ ...prev, resume: file }));
    } else {
      setForm((prev) => ({ ...prev, resume: null }));
    }
  };

  const handleRemoveFile = () => {
    setForm((prev) => ({ ...prev, resume: null }));
    setFileError(null);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"][name="resume"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFileError(null);
    
    try {
      await onSubmit(form);
      // Only reset form on success
      setForm(emptyForm);
      setFileError(null);
      if (event.currentTarget) {
        event.currentTarget.reset();
      }
    } catch (error) {
      // Error is handled by parent component, but we keep form state
      console.error('Error submitting form:', error);
    }
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

      <div className="file-upload-wrapper">
        <label className="file-input-label">
          <span>Resume (PDF, optional)</span>
          <span className="file-input-hint">Maximum file size: {MAX_FILE_SIZE_MB}MB</span>
        </label>
        
        {!form.resume ? (
          <label className="file-input">
            <input
              type="file"
              name="resume"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
            <div className="file-input-content">
              <Upload size={24} className="file-input-icon" />
              <div className="file-input-text">
                <strong>Click to upload</strong> or drag and drop
                <span className="file-input-format">PDF only</span>
              </div>
            </div>
          </label>
        ) : (
          <div className="file-preview">
            <div className="file-preview-info">
              <FileText size={20} className="file-preview-icon" />
              <div className="file-preview-details">
                <strong className="file-preview-name">{form.resume.name}</strong>
                <span className="file-preview-size">{formatFileSize(form.resume.size)}</span>
              </div>
              <CheckCircle2 size={20} className="file-preview-success" />
            </div>
            {!isSubmitting && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="file-remove-btn"
                title="Remove file"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {fileError && (
          <div className="file-error">
            <AlertCircle size={16} />
            <span>{fileError}</span>
          </div>
        )}
      </div>
    </form>
  );
};

export default CandidateForm;

