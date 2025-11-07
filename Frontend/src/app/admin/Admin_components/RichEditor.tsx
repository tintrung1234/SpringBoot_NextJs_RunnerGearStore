'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Định nghĩa interface cho props
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string | number;
}

// Định nghĩa interface cho ref
interface RichTextEditorRef {
  insertImage: (url: string) => void;
}

// Cấu hình modules cho toolbar của Quill
const modules = {
  toolbar: [
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ header: 1 }, { header: 2 }],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    [{ align: [] }],
    ['link', 'image', 'video', 'formula'],
    ['clean'],
  ],
};

// Cấu hình formats được hỗ trợ
const formats = [
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'code-block',
  'color',
  'background',
  'script',
  'header',
  'list',
  'list',
  'indent',
  'direction',
  'align',
  'link',
  'image',
  'video',
  'formula',
];

// Component RichTextEditor với forwardRef
const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, height = '60vh' }, ref) => {
    const quillRef = useRef<ReactQuill>(null);

    // Expose hàm insertImage thông qua ref
    useImperativeHandle(ref, () => ({
      insertImage: (url: string) => {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true); // Lấy vị trí con trỏ, tự động focus nếu chưa có
          if (range) {
            editor.insertEmbed(range.index, 'image', url);
            console.log('Chèn hình thành công:', url);
          } else {
            console.warn('Không thể chèn hình: Không tìm thấy vị trí con trỏ');
          }
        } else {
          console.warn('Không thể chèn hình: Quill editor chưa sẵn sàng');
        }
      },
    }));

    return (
      <div className="w-full mb-4" style={{ height }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          className="bg-white rounded"
          style={{ height: '100%', width: '100%' }}
        />
      </div>
    );
  }
);

// Đặt tên hiển thị cho component để debug dễ hơn
RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;