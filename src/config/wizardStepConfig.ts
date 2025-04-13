import { ValidationSectionKey } from '../hooks/useCharacterValidation';

export interface SpecialValidation {
  type: string;
  fieldPath?: string;
  fieldPaths?: string[];
}

/**
 * Configuration for wizard steps
 */
export interface WizardStepConfig {
  id: string;
  title: string;
  subtitle?: string;
  validationType?: ValidationSectionKey | null;
  skipValidation?: boolean;
  requiredFields?: string[];
  fieldRules?: Record<string, string>;
  fieldLabels?: Record<string, string>;
  specialValidations?: Record<string, SpecialValidation>; 
  dependencies?: {
    clients?: string[];
    fields?: string[];
  };
  canSkip?: boolean;
}

/**
 * Configuration for all wizard steps
 */
export const WIZARD_STEPS_CONFIG: WizardStepConfig[] = [
  {
    id: 'step-generate',
    title: 'Autogenerate your Agent',
    subtitle: 'Create your Agent personality with a seed prompt',
    validationType: null, // No specific validation for this step
    skipValidation: false,
    canSkip: true,
    dependencies: {
      fields: ['name']
    }
  },
  {
    id: 'step-basics',
    title: 'Basic Information',
    subtitle: 'Set name, model and clients',
    validationType: 'basicInfo',
    requiredFields: ['name', 'clients', 'modelProvider'],
    canSkip: false,
    fieldRules: {
      'name': 'required|string|min:1',
      'clients': 'required|array|min:1',
      'clients.*': 'in:telegram,twitter'
    },
    fieldLabels: {
      'name': 'Character Name',
      'clients': 'Supported Platforms',
      'modelProvider': 'Large Language Model'
    },
    specialValidations: {
      telegram: {
        type: 'telegramCredentials',
        fieldPath: 'settings.secrets.TELEGRAM_BOT_TOKEN'
      },
      twitter: {
        type: 'twitterCredentials',
        fieldPaths: [
          'settings.secrets.TWITTER_USERNAME',
          'settings.secrets.TWITTER_PASSWORD',
          'settings.secrets.TWITTER_EMAIL'
        ]
      }
    },
  },
  {
    id: 'step-details',
    title: 'Character Details',
    subtitle: 'Define personality and style',
    validationType: 'details',
    requiredFields: ['bio', 'style.all'],
    fieldRules: {
      'bio': 'required|array|min:1',
      'style.all': 'required|array|min:1'
    },
    fieldLabels: {
      'bio': 'Bio',
      'style.all': 'General Style'
    },
    dependencies: {
      fields: ['name', 'clients', 'modelProvider'],
    }
  },
  {
    id: 'step-knowledge',
    title: 'Knowledge',
    subtitle: 'Add knowledge for your character',
    skipValidation: true, // Knowledge is optional
    dependencies: {
      fields: ['name', 'clients', 'modelProvider'],
    }
  },
  {
    id: 'step-examples',
    title: 'Examples',
    subtitle: 'Add message and post examples',
    validationType: 'examples',
    requiredFields: ['postExamples', 'messageExamples'],
    fieldRules: {
      'postExamples': 'required|array|min:1',
      'postExamples.*': 'required|string|min:10',
      // Each conversation should have at least 1 pair of messages:
      'messageExamples': 'required|array|min:1',
      // Each message pair should have at least 2 examples (user and agent):
      'messageExamples.*': 'required|array|min:2',
      // Validation for each message:
      'messageExamples.*.*.user': 'required|string',
      'messageExamples.*.*.content': 'required|array',
      'messageExamples.*.*.content.text': 'required|string|min:3'
    },
    fieldLabels: {
      'postExamples': 'Post Examples',
      'messageExamples': 'Message Examples',
      'messageExamples.*.*.content.text': 'user/Agent message content'
    },
    dependencies: {
      fields: ['name', 'clients', 'modelProvider'],
    }
  },
  {
    id: 'step-attributes',
    title: 'Attributes & People',
    subtitle: 'Define adjectives and people related to your character',
    validationType: 'attributes',
    requiredFields: ['adjectives'],
    fieldRules: {
      'adjectives': 'required|array|min:3',
      'adjectives.*': 'required|string|min:2'
    },
    fieldLabels: {
      'adjectives': 'Character Adjectives',
      'adjectives.*': 'adjective'
    },
    dependencies: {
      fields: ['name', 'clients', 'modelProvider'],
    }
  },
  {
    id: 'step-review',
    title: 'Review',
    subtitle: 'Review your character settings',
    validationType: 'fullCharacter',
    dependencies: {
      fields: ['name', 'clients', 'modelProvider'],
    }
  }
];