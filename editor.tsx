import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { styled } from "styled-components";
import { darken } from "polished";

type TextNode = {
  start: number;
  end: number;
  text: string;
  styles: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
};

type TextStyles = "bold" | "italic" | "underline";

const H1 = styled.div`
  font-size: 1.5rem;
  line-height: 1.5rem;
  margin: 0.5rem 0;
`;

const Secondary = styled.span`
  color: ${darken(0.4, "rgb(255, 255, 255)")};
`;

const ContentEditable = styled.div`
  border: 1px solid ${darken(0.6, "rgb(255, 255, 255)")};
  border-radius: 0.4rem;
  padding: 0.5rem 1rem;
  margin: 1rem 0;
  min-height: 6rem;
`;

const EditButton = styled(Button)`
  margin-right: 0.4rem;
`;

const Editor = () => {
  const contentEditableRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<TextNode | null>(null);
  const [textNodes, setTextNodes] = useState<TextNode[]>([]);

  useEffect(() => {
    const contentEditable = contentEditableRef.current;
    if (!contentEditable) return;

    const handleInput = () => {
      const text = contentEditable.innerText;
      const chunks = text.split(" ");

      const nodes = chunks.reduce((acc, text) => {
        const start = acc[acc.length - 1] ? acc[acc.length - 1].end + 1 : 0;
        const end = start + text.length;
        const styles = { bold: false, italic: false, underline: false };
        const node = { text, start, end, styles };
        if (
          !acc.some(
            (n) =>
              n.text === node.text &&
              n.start === node.start &&
              n.end === node.end
          )
        ) {
          acc.push(node);
        }
        return acc;
      }, [] as TextNode[]);

      setTextNodes(nodes);
    };

    contentEditable.addEventListener("input", handleInput);
    return () => removeEventListener("input", handleInput);
  }, []);

  useEffect(() => {
    const contentEditable = contentEditableRef.current;
    if (!contentEditable) return;

    const handleSelect = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const start = range.startOffset;
      let end = range.endOffset;
      let text = range.toString();

      if (text.endsWith(" ")) {
        end -= 1;
        text = text.substring(0, text.length - 1);
      }

      const node = textNodes.find(
        (node) => start === node.start && end === node.end && text === node.text
      );

      node && setSelectedNode(node);
    };

    document.addEventListener("selectionchange", handleSelect);
    return () => document.removeEventListener("selectionchange", handleSelect);
  }, [textNodes]);

  const handleStyles = (style: TextStyles) => {
    if (!selectedNode) return;
    const node = selectedNode;
    setTextNodes((s) =>
      s.map((n) =>
        n.start === node.start && n.end === node.end && n.text === node.text
          ? {
              ...n,
              styles: {
                ...n.styles,
                [style]: !n.styles[style],
              },
            }
          : n
      )
    );
  };

  const applyStyles = (
    text: string,
    styles: { bold: boolean; italic: boolean; underline: boolean }
  ) => {
    let styledText = text;
    if (styles.bold) {
      styledText = `<b>${styledText}</b>`;
    }
    if (styles.italic) {
      styledText = `<i>${styledText}</b>`;
    }
    if (styles.underline) {
      styledText = `<u>${styledText}</u>`;
    }
    return styledText;
  };

  const renderText = () => {
    return textNodes.map((textNode, i) => (
      <>
        <span
          key={i}
          dangerouslySetInnerHTML={{
            __html: applyStyles(textNode.text, textNode.styles),
          }}
        />{" "}
      </>
    ));
  };

  return (
    <div>
      <H1>Preview:</H1>
      <div>
        {textNodes.length === 0 && (
          <Secondary>Type something below...</Secondary>
        )}
        {renderText()}
      </div>
      <ContentEditable contentEditable ref={contentEditableRef}>
        {/* Input */}
      </ContentEditable>
      <EditButton onClick={() => handleStyles("bold")}>B</EditButton>
      <EditButton onClick={() => handleStyles("italic")}>I</EditButton>
      <EditButton onClick={() => handleStyles("underline")}>U</EditButton>
    </div>
  );
};

export { Editor };
