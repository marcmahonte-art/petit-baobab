import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import { CoverTemplate } from "./CoverTemplate";
import { PortraitTemplate } from "./PortraitTemplate";
import { YearTemplate } from "./YearTemplate";
import { FriendsTemplate } from "./FriendsTemplate";
import { MemoriesTemplate } from "./MemoriesTemplate";
import { BooksTemplate } from "./BooksTemplate";
import { PrideTemplate } from "./PrideTemplate";
import { VacationTemplate } from "./VacationTemplate";
import { MessagesTemplate } from "./MessagesTemplate";
import { SecretsTemplate } from "./SecretsTemplate";

export interface TemplateComponentProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
  onRequestPhotoUpload?: () => void;
}

export const templateRegistry: Record<string, React.FC<TemplateComponentProps>> = {
  "cover-v1": CoverTemplate,
  "portrait-v1": PortraitTemplate,
  "year-v1": YearTemplate,
  "friends-v1": FriendsTemplate,
  "memories-v1": MemoriesTemplate,
  "books-v1": BooksTemplate,
  "pride-v1": PrideTemplate,
  "vacation-v1": VacationTemplate,
  "messages-v1": MessagesTemplate,
  "secrets-v1": SecretsTemplate,
};

export function getTemplateComponent(templateId?: string): React.FC<TemplateComponentProps> {
  if (!templateId) return PortraitTemplate;
  return templateRegistry[templateId] || PortraitTemplate;
}
