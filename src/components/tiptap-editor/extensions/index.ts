import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TableKit as Table } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyleKit as TextStyle } from '@tiptap/extension-text-style';
import { CharacterCount, Placeholder, Selection } from '@tiptap/extensions';
import { StarterKit } from '@tiptap/starter-kit';

import { CellAlign } from './cell-align';
import { ImageFigure } from './image';
import { Link } from './link';
import { Youtube } from './youtube';

type ExtensionConfig = {
  placeholder?: string | Record<string, string>;
};

export function createExtensions({ placeholder }: ExtensionConfig) {
  return [
    StarterKit.configure({
      horizontalRule: false,
      hardBreak: false,
      codeBlock: false,
      link: false,
      listItem: {}
    }),
    Placeholder.configure({
      includeChildren: true,
      showOnlyCurrent: true,
      showOnlyWhenEditable: true,
      placeholder: ({ node }) => {
        if (typeof placeholder === 'string') return placeholder;
        if (placeholder && node.type.name in placeholder) {
          return placeholder[node.type.name];
        }
        return 'Write something…';
      }
    }),
    Link,
    Subscript,
    Superscript,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Selection,
    CharacterCount,
    CellAlign,
    Table.configure({
      table: {
        cellMinWidth: 35,
        resizable: true
      }
    }),
    TextStyle.configure({
      lineHeight: false,
      fontFamily: false,
      fontSize: false
    }),
    ImageFigure,
    Youtube
  ];
}
