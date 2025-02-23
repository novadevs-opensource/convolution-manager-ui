# Convolution Manager UI

A comprehensive web-based tool for creating, managing, and customizing AI agents with their character definitions. This tool integrates with various AI models through OpenRouter API and provides extensive knowledge integration capabilities.

## Features

### Character Generation & Refinement
- **AI-Powered Generation**: Create characters using various AI models including:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude 3, Claude 2)
  - Google (Gemini Pro, PaLM 2)
  - Meta (Llama 2)
  - Mistral (Large, Medium, Small)
  - And more through OpenRouter API
- **Custom Prompting**: Generate characters from detailed text descriptions
- **Character Refinement**: 
  - Enhance existing characters with additional prompts
  - Maintain core traits while adding new features
  - Preserve or expand knowledge base
  - Update character attributes seamlessly
- **Manual Creation**: Build characters from scratch with a structured interface

### Character Components
- **Basic Information**
  - Character name
  - Model provider selection
  - Voice model settings
  - Client compatibility (Discord, Direct, Twitter, Telegram, Farcaster)

- **Character Details**
  - Biography system
  - Lore integration
  - Topic expertise definition
  - Personality traits
  - Speaking style customization

- **Conversation Examples**
  - User-character interaction samples
  - Dynamic message pair creation
  - Example management system

- **Knowledge Integration**
  - PDF document processing
  - Text file integration
  - Manual knowledge entry
  - Knowledge organization system

### Style Configuration
- **Multi-Context Styling**
  - General communication style
  - Chat-specific behavior
  - Post formatting preferences
  - Writing style guidelines

### Backup & Management
- **Auto-Save System**
  - Automatic backups every 5 minutes
  - Named backup creation
  - Compact backup display
  - Hover timestamps
  - Backup management interface
  - Backup restoration

### User Interface
- **Theme Support**
  - Dark mode
  - Light mode
  - System preference detection
- **Responsive Design**
  - Desktop optimization
  - Tablet support
  - Mobile-friendly layout
- **Compact Layout**
  - Scrollable backup list
  - Efficient space utilization
  - Organized sections

### File Management
- **Import/Export**
  - JSON file import
  - Character export
  - Drag-and-drop support
  - File validation

### API Integration
- **OpenRouter Integration**
  - API key management
  - Model selection
  - Secure key storage
  - Error handling

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd convolution-manager-ui
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Access the application at http://localhost:5173

## Requirements

### System Requirements
- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser with JavaScript enabled

### API Requirements
- OpenRouter API key (obtain from [openrouter.ai](https://openrouter.ai))

## Usage Guide

### Initial Setup
1. Open the application in your web browser
2. Set your OpenRouter API key in the settings
3. Choose your preferred theme (dark/light)

### Creating a Character
1. **Using AI Generation**:
   - Select an AI model
   - Enter a character description
   - Click the lightning bolt icon to generate
   - Review and modify the generated character

2. **Refining a Character**:
   - Load or generate an initial character
   - Enter refinement instructions in the prompt
   - Click the wand icon to refine
   - Review the enhanced character

3. **Manual Creation**:
   - Fill in basic information
   - Add character details
   - Define conversation style
   - Create message examples
   - Add knowledge entries

### Knowledge Integration
1. **File Upload**:
   - Drag and drop files into the knowledge zone
   - Supported formats: PDF, TXT, MD, JSON, CSV
   - Process files to extract knowledge

2. **Manual Entry**:
   - Add knowledge entries directly
   - Organize and edit entries
   - Review integrated knowledge

### Saving and Exporting
1. **Auto-Save**:
   - Work is automatically saved every 5 minutes
   - Create named backups for important versions
   - View backup timestamps on hover
   - Manage backups in scrollable list

2. **Export**:
   - Generate final JSON
   - Download character file

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

### Core Team

- Convolution Created by [ConvolutionSOL](https://github.com/ConvolutionSOL)
- Tool Development by [bruno.sh](https://github.com/brunolorente)

## Support

For support, please:
1. Check the [GitHub Issues](https://github.com/brunolorente/convolution-character-generator/issues)
2. Join the [Convolution DAO](https://www.daos.fun/)
