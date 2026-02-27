"use client";

import React from "react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { uploadImage } from "@/actions/upload";

const SunEditor = dynamic(() => import("suneditor-react").then((mod) => mod.default || mod), {
  ssr: false,
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({ value, onChange, placeholder, minHeight = 200 }: RichTextEditorProps) {
  
  const handleImageUploadBefore = (files: File[], _info: object, uploadHandler: (response: any) => void) => {
    (async () => {
      try {
        const formData = new FormData();
        formData.append("file", files[0]);
        const res = await uploadImage(formData);
        
        if (res.success && res.url) {
          const response = {
            result: [
              {
                url: res.url,
                name: files[0].name,
                size: files[0].size,
              },
            ],
          };
          uploadHandler(response);
        } else {
          uploadHandler({ errorMessage: "Upload failed" });
        }
      } catch (err) {
        console.error(err);
        uploadHandler({ errorMessage: "Upload error" });
      }
    })();
    return false; // Prevent default upload behavior
  };

  return (
    <div style={{ borderRadius: "4px", overflow: "hidden", maxWidth: "100%", width: "100%" }}>
      <SunEditor
        setContents={value}
        onChange={onChange}
        placeholder={placeholder}
        height={`${minHeight}px`}
        setOptions={{
          buttonList: [
            ["undo", "redo"],
            ["font", "fontSize", "formatBlock"],
            ["bold", "underline", "italic", "strike", "subscript", "superscript"],
            ["fontColor", "hiliteColor"],
            ["removeFormat"],
            ["outdent", "indent"],
            ["align", "horizontalRule", "list", "lineHeight"],
            ["table", "link", "image"],
            ["fullScreen", "showBlocks", "codeView"],
            ["preview", "print"]
          ],
          font: ['Arial', 'Comic Sans MS', 'Courier New', 'Impact', 'Georgia','Tahoma', 'Trebuchet MS', 'Verdana'],
          defaultStyle: "font-family: Arial; font-size: 16px;",
          minHeight: `${minHeight}px`
        }}
        onImageUploadBefore={handleImageUploadBefore}
      />
    </div>
  );
}
