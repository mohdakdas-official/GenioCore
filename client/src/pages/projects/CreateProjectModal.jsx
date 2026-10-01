import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../components/ui/Model";
import { Input, Textarea } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { X } from "lucide-react";
import { projectSchema } from "../../validation/projects.validation";

export const CreateProjectModal = ({ isOpen, onClose, onCreateProject }) => {
  const [languages, setLanguages] = useState([]);
  const [frameworks, setFrameworks] = useState([]);
  const [langInput, setLangInput] = useState("");
  const [frameworkInput, setFrameworkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleAddTag = (list, setList, val, setVal) => {
    const trimmed = val.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setVal("");
    }
  };
  const handleClose = () => {
    if (isSubmitting) return;

    reset();

    setLanguages([]);
    setFrameworks([]);
    setLangInput("");
    setFrameworkInput("");

    onClose();
  };
  const handleRemoveTag = (list, setList, tagToRemove) => {
    setList(list.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      const pendingLanguage = langInput.trim();
      const pendingFramework = frameworkInput.trim();

      const finalLanguages = [
        ...languages,
        ...(pendingLanguage ? [pendingLanguage] : []),
      ];

      const finalFrameworks = [
        ...frameworks,
        ...(pendingFramework ? [pendingFramework] : []),
      ];

      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        languages: [...new Set(finalLanguages)],
        frameworks: [...new Set(finalFrameworks)],
      };

      console.log("Create project modal payload:", payload);

      await onCreateProject?.(payload);

      reset();

      setLanguages([]);
      setFrameworks([]);
      setLangInput("");
      setFrameworkInput("");

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      subtitle="Create a project workspace for code reviews and analysis."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. auth-gateway-api"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Description (Optional)"
          placeholder="Short summary of the module or service..."
          error={errors.description?.message}
          {...register("description")}
        />

        {/* Dynamic Languages Tagging */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-primary">
            Languages
          </label>
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            {languages.map((l) => (
              <span
                key={l}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-primary"
              >
                {l}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(languages, setLanguages, l)}
                  className="hover:text-error"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(
                    languages,
                    setLanguages,
                    langInput,
                    setLangInput,
                  );
                }
              }}
              placeholder="Add language (e.g. Go, Rust)"
              className="flex-1 h-8 px-2.5 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                handleAddTag(languages, setLanguages, langInput, setLangInput)
              }
            >
              Add
            </Button>
          </div>
        </div>

        {/* Dynamic Frameworks Tagging */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-text-primary">
            Frameworks & Tools
          </label>
          <div className="flex gap-1.5 flex-wrap mb-1.5">
            {frameworks.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary"
              >
                {f}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(frameworks, setFrameworks, f)}
                  className="hover:text-error"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={frameworkInput}
              onChange={(e) => setFrameworkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(
                    frameworks,
                    setFrameworks,
                    frameworkInput,
                    setFrameworkInput,
                  );
                }
              }}
              placeholder="Add framework (e.g. Express, Tailwind)"
              className="flex-1 h-8 px-2.5 text-xs bg-surface border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-primary"
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                handleAddTag(
                  frameworks,
                  setFrameworks,
                  frameworkInput,
                  setFrameworkInput,
                )
              }
            >
              Add
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
