import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Undo,
  Redo,
  Type
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { Tooltip } from './ui/tooltip';
import React from 'react';

type MenuItemProps = {
  icon: React.ReactNode;
  onClick: () => void;
  isActive: boolean;
  tooltip: string;
};

const MenuItem = ({ icon, onClick, isActive, tooltip }: MenuItemProps) => (
  <Tooltip>
    <button
      onClick={onClick}
      className={`rounded-md p-2 transition-all ${
        isActive
          ? 'bg-slate-200 text-slate-900'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
      aria-label={tooltip}
    >
      {icon}
    </button>
  </Tooltip>
);

const Divider = () => <div className='mx-1 h-6 w-px bg-slate-200' />;

export default function MenuBar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return null;
  }

  const menuGroups = [
    // Text formatting group
    [
      {
        icon: <Bold className='size-4' />,
        onClick: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive('bold'),
        tooltip: 'Bold'
      },
      {
        icon: <Italic className='size-4' />,
        onClick: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive('italic'),
        tooltip: 'Italic'
      },
      {
        icon: <Strikethrough className='size-4' />,
        onClick: () => editor.chain().focus().toggleStrike().run(),
        isActive: editor.isActive('strike'),
        tooltip: 'Strikethrough'
      },
      {
        icon: <Highlighter className='size-4' />,
        onClick: () => editor.chain().focus().toggleMark('highlight').run(),
        isActive: editor.isActive('highlight'),
        tooltip: 'Highlight'
      }
    ],
    // Heading group
    [
      {
        icon: <Type className='size-4' />,
        onClick: () => editor.chain().focus().setParagraph().run(),
        isActive: editor.isActive('paragraph'),
        tooltip: 'Paragraph'
      },
      {
        icon: <Heading1 className='size-4' />,
        onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive('heading', { level: 1 }),
        tooltip: 'Heading 1'
      },
      {
        icon: <Heading2 className='size-4' />,
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive('heading', { level: 2 }),
        tooltip: 'Heading 2'
      },
      {
        icon: <Heading3 className='size-4' />,
        onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive('heading', { level: 3 }),
        tooltip: 'Heading 3'
      }
    ],
    // Alignment group
    [
      {
        icon: <AlignLeft className='size-4' />,
        onClick: () => editor.chain().focus().setTextAlign('left').run(),
        isActive: editor.isActive({ textAlign: 'left' }),
        tooltip: 'Align left'
      },
      {
        icon: <AlignCenter className='size-4' />,
        onClick: () => editor.chain().focus().setTextAlign('center').run(),
        isActive: editor.isActive({ textAlign: 'center' }),
        tooltip: 'Align center'
      },
      {
        icon: <AlignRight className='size-4' />,
        onClick: () => editor.chain().focus().setTextAlign('right').run(),
        isActive: editor.isActive({ textAlign: 'right' }),
        tooltip: 'Align right'
      }
    ],
    // List group
    [
      {
        icon: <List className='size-4' />,
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive('bulletList'),
        tooltip: 'Bullet list'
      },
      {
        icon: <ListOrdered className='size-4' />,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive('orderedList'),
        tooltip: 'Numbered list'
      }
    ],
    // History group
    [
      {
        icon: <Undo className='size-4' />,
        onClick: () => editor.chain().focus().undo().run(),
        isActive: false,
        tooltip: 'Undo'
      },
      {
        icon: <Redo className='size-4' />,
        onClick: () => editor.chain().focus().redo().run(),
        isActive: false,
        tooltip: 'Redo'
      }
    ]
  ];

  return (
    <div className='sticky top-0 z-50 mb-1 flex flex-wrap items-center rounded-md border bg-white p-1 shadow-sm'>
      {menuGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {groupIndex > 0 && <Divider />}
          <div className='mx-1 flex items-center'>
            {group.map((item, itemIndex) => (
              <MenuItem
                key={itemIndex}
                icon={item.icon}
                onClick={item.onClick}
                isActive={item.isActive}
                tooltip={item.tooltip}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
