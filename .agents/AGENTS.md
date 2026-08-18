# Prism Global Rules

## Prism Design Law #1
Every new input type must transform its content into the standard processedContent contract. The AI analysis pipeline must remain agnostic to the source format.

## Prism Design Law #2
Processors extract and normalize content. They do not perform analysis or make provider-specific decisions.

## Prism Design Law #3
External AI providers are interchangeable. Processors communicate only with generic internal services, never directly with provider SDKs.

## Prism Design Law #4
New capabilities should compose existing processors before introducing new extraction logic.
