---
title: About GitHub Code Quality
shortTitle: GitHub Code Quality
allowTitleToDifferFromFilename: true
intro: '{% data variables.product.prodname_code_quality %} flags code quality issues in pull requests and repository scans, applies {% data variables.product.prodname_copilot_short %}-powered autofixes, and enforces standards with rulesets.'
product: '{% data reusables.gated-features.code-quality-availability %}'
versions:
  feature: code-quality
contentType: concepts
redirect_from:
  - /code-security/code-quality/concepts/about-code-quality
  - /code-security/code-quality/concepts
  - /code-security/code-quality
category:
  - Improve code quality
---

{% data reusables.code-quality.code-quality-preview-note %}

## Overview

{% data variables.product.prodname_code_quality %} helps you ensure your codebase is reliable, maintainable, and efficient. Whether you're building a new feature, reducing technical debt, or reporting on repository health, {% data variables.product.prodname_code_quality_short %} provides actionable insights and automated fixes so you can improve and maintain the code health of your repository efficiently.

## Key features and benefits

With {% data variables.product.prodname_code_quality_short %}, you can:

* Identify code quality risks and opportunities in **pull requests** and through **repository scans**.
* Review clear explanations for findings and apply one-click **{% data variables.product.prodname_copilot_short %}-powered autofixes**.
* Use **repository dashboards** to track reliability and maintainability scores, identify areas needing attention, and prioritize remediation.
* Monitor **organization dashboards** to understand the code health of your repositories at a glance and determine which repositories to investigate further.
* Set up **rulesets** for pull requests to enforce code quality standards and block changes that do not meet your criteria.
* Upload **code coverage** reports to see test coverage metrics directly on pull requests, helping reviewers identify untested code.
* Easily assign remediation work to **{% data variables.copilot.copilot_cloud_agent %}**, if you have a {% data variables.product.prodname_copilot_short %} license.

## Availability and usage costs

{% data variables.product.prodname_code_quality %} is available for organization-owned repositories on {% data variables.product.prodname_team %} and {% data variables.product.prodname_ghe_cloud %} plans.

<!-- expires 2026-07-20 -->

{% data variables.product.prodname_code_quality %} is currently in {% data variables.release-phases.public_preview %} and will become generally available on July 20, 2026. During {% data variables.release-phases.public_preview %}, {% data variables.product.prodname_code_quality_short %} scans will consume {% data variables.product.prodname_actions %} minutes but you will not be billed for other usage. From July 20, 2026, usage will incur additional charges. See [AUTOTITLE](/billing/concepts/product-billing/github-code-quality).

If you want to avoid charges, disable {% data variables.product.prodname_code_quality_short %} before July 20, 2026. See [AUTOTITLE](/code-security/how-tos/maintain-quality-code/disable-code-quality).

<!-- end expires 2026-07-20 -->

> [!NOTE]
> You **don't** need a {% data variables.product.prodname_copilot_short %} or a {% data variables.product.prodname_code_security %} license to use {% data variables.product.prodname_code_quality_short %} or apply {% data variables.product.prodname_copilot_short %}-powered autofixes.

## Supported languages

{% data variables.product.prodname_code_quality_short %} performs rule-based analysis of the following languages using {% data variables.product.prodname_codeql %}:

{% data reusables.code-quality.codeql-supported-languages %}

{% data variables.product.prodname_code_quality_short %} also performs AI-powered analysis with results displayed separately on the "**{% data variables.code-quality.recent_suggestions %}**" repository dashboard. Unlike the rule-based {% data variables.product.prodname_codeql %} analysis that scans the entire codebase and pull requests, this AI-powered analysis only examines files recently pushed to the default branch and may identify issues in languages beyond those listed above. For more information, see [AUTOTITLE](/code-security/code-quality/responsible-use/code-quality).
