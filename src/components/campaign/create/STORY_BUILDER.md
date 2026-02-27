# StoryBuilder Documentation

## Overview
StoryBuilder is a dynamic, guided form component for creating campaign stories without using a WYSIWYG editor. It generates HTML output based on structured user input.

## Adding a New Category

To add a new category (e.g., "Non-Medis" or "Pendidikan"):

1.  **Define Steps Configuration**:
    Create a new array of `StepConfig` objects in `StoryBuilder.tsx` (or a separate config file).

    ```typescript
    const EDUCATION_STEPS: StepConfig[] = [
      {
        title: "Latar Belakang Pendidikan",
        description: "Ceritakan tentang institusi atau individu yang membutuhkan bantuan.",
        fields: [
          {
            key: "background",
            label: "Latar Belakang",
            placeholder: "Jelaskan situasi saat ini...",
            minRows: 4,
            example: "Sekolah kami mengalami kerusakan berat akibat...",
          },
        ],
        photoKey: "school_photo",
        photoLabel: "Foto Sekolah",
      },
      // Add more steps...
    ];
    ```

2.  **Update Component Logic**:
    In `StoryBuilder.tsx`, update the `steps` selection logic:

    ```typescript
    const steps = category === "sakit" 
      ? MEDICAL_STEPS 
      : category === "pendidikan" 
        ? EDUCATION_STEPS 
        : DEFAULT_STEPS;
    ```

3.  **Usage**:
    Pass the category prop when using the component:

    ```tsx
    <StoryBuilder
      category="pendidikan"
      initialData={...}
      onComplete={...}
      onBack={...}
    />
    ```

## Data Structure
The component outputs:
- `html`: Generated HTML string for display.
- `structure`: JSON object containing raw field values (for editing).

## Styling
The component uses MUI components and follows the project's design system.
