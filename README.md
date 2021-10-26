# phpstan-diff-action

This action check the difference between two phpstan reports, notice resolved errors and failed if new errors are detected.

## Inputs

| name            | required | description                                  | 
|:----------------|:--------:|:---------------------------------------------|
| `origin_report` | true     | The path to the original PHPStan json report |
| `new_report`    | true     | The path to the new PHPStan json report      |

## Example usage

```yaml
on: pull_request
jobs:
  runs_on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
      with:
        ref: ${{ github.base_ref }}
        
    - run: phpstan analyse --level=8 --error-format=json src > /tmp/origin.phpstan.json
    
    - uses: actions/checkout@v2
      with:
        ref: ${{ github.ref }}
        
    - run: phpstan analyse --level=8 --error-format=json src > /tmp/new.phpstan.json
    
    - uses: csocquet/phpstan-diff-action
      with: 
        origin_report: /tmp/origin.phpstan.json
        new_report: /tmp/new.phpstan.json
```

