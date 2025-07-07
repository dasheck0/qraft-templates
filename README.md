# Unbox Templates

This repository contains template boxes for the [unbox](https://github.com/dasheck0/unbox) CLI tool.

## Available Boxes

- **.tasks** - AI workflow files and task management structure
- **n8n** - n8n backend project templates and configuration
- **readme** - Documentation scaffolding and README templates

## Usage

```bash
# List available boxes
npx unbox list

# Copy a specific box
npx unbox .tasks

# Interactive mode
npx unbox -i
```

## Box Structure

Each box is a directory containing:
- `manifest.json` - Metadata and configuration
- Template files and directories

## Contributing

To add a new box:
1. Create a new directory in `boxes/`
2. Add a `manifest.json` with metadata
3. Add your template files
4. Submit a pull request
