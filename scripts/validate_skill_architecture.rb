#!/usr/bin/env ruby

require "pathname"
require "json"
require "psych"
require "set"
require "uri"

ROOT = Pathname(ENV.fetch("ARCHITECTURE_ROOT", File.expand_path("..", __dir__)))
PROMOTIONS = {
  "pipa-setup" => ["pipa-manage", "skills/pipa-manage/references/setup.md"],
  "pipa-connectors" => ["pipa-manage", "skills/pipa-manage/references/connectors.md"],
  "pipa-project-charter" => ["pipa-define-work", "skills/pipa-define-work/references/initiate-charter-and-viability-gate.md"],
  "pipa-problem-framing" => ["pipa-define-work", "skills/pipa-define-work/references/initiate-problem-framing.md"],
  "pipa-stakeholder-map" => ["pipa-define-work", "skills/pipa-define-work/references/initiate-stakeholder-map.md"],
  "pipa-daily-plan" => ["pipa-define-work", "skills/pipa-define-work/references/plan-daily-planning.md"],
  "pipa-decision-log" => ["pipa-define-work", "skills/pipa-define-work/references/plan-raid-raci-decision-setup.md"],
  "pipa-requirements-brief" => ["pipa-define-work", "skills/pipa-define-work/references/plan-requirements-brief.md"],
  "pipa-roadmap" => ["pipa-define-work", "skills/pipa-define-work/references/plan-roadmap-and-prioritization.md"],
  "pipa-scope-baseline" => ["pipa-define-work", "skills/pipa-define-work/references/plan-scope-schedule-baseline.md"],
  "pipa-work-coordination" => ["pipa-deliver-work", "skills/pipa-deliver-work/references/execute-work-package-coordination.md"],
  "pipa-iteration-cycle" => ["pipa-deliver-work", "skills/pipa-deliver-work/references/execute-iteration-cycle.md"],
  "pipa-dependency-handoff" => ["pipa-deliver-work", "skills/pipa-deliver-work/references/execute-dependency-and-handoff.md"],
  "pipa-risk-escalation" => ["pipa-deliver-work", "skills/pipa-deliver-work/references/monitor-risk-escalation.md"],
  "pipa-status-update" => ["pipa-deliver-work", "skills/pipa-deliver-work/references/monitor-status.md"],
  "pipa-ticket-triage" => ["pipa-deliver-work", "skills/pipa-deliver-work/references/monitor-ticket-triage.md"],
  "pipa-change-control" => ["pipa-get-paid", "skills/pipa-get-paid/references/execute-change-control.md"],
  "pipa-budget-setup" => ["pipa-get-paid", "skills/pipa-get-paid/references/initiate-budget.md"],
  "pipa-budget-review" => ["pipa-get-paid", "skills/pipa-get-paid/references/monitor-budget.md"],
  "pipa-acceptance-signoff" => ["pipa-improve-operations", "skills/pipa-improve-operations/references/close-acceptance-signoff.md"],
  "pipa-closeout-review" => ["pipa-improve-operations", "skills/pipa-improve-operations/references/close-benefits-review-and-archive.md"],
  "pipa-daily-shutdown" => ["pipa-improve-operations", "skills/pipa-improve-operations/references/close-daily-shutdown.md"],
  "pipa-handover" => ["pipa-improve-operations", "skills/pipa-improve-operations/references/close-handover-transition.md"],
  "pipa-retrospective" => ["pipa-improve-operations", "skills/pipa-improve-operations/references/close-lessons-learned.md"]
}.freeze
REMOVED_ROUTER_PATHS = %w[
  skills/pipa-define-work/references/define-work.md
  skills/pipa-define-work/references/initiate.md
  skills/pipa-define-work/references/plan.md
  skills/pipa-deliver-work/references/deliver-work.md
  skills/pipa-deliver-work/references/execute.md
  skills/pipa-deliver-work/references/monitor.md
  skills/pipa-get-paid/references/getting-paid.md
  skills/pipa-get-work/references/get-work.md
  skills/pipa-improve-operations/references/close.md
  skills/pipa-improve-operations/references/improve-operations.md
  skills/pipa-keep-clients/references/keep-clients.md
].freeze
NAME_EXCEPTIONS = { "composio" => "composio-mcp" }.freeze

def frontmatter(path)
  content = path.read
  match = content.match(/\A---\s*\n(.*?)\n---\s*\n/m)
  return nil unless match

  Psych.safe_load(match[1], permitted_classes: [], aliases: false)
rescue Psych::SyntaxError
  nil
end

def local_link_targets(content)
  content.scan(/\[[^\]]*\]\(([^)]+)\)/).flatten.each_with_object([]) do |raw, targets|
    next if raw.strip.match?(/\A<[^>]*\s[^>]*>\z/)

    target = raw.strip.sub(/\s+["'][^"']*["']\z/, "").delete_prefix("<").delete_suffix(">")
    next if target.empty? || target.start_with?("#") || target.match?(/\A[a-z][a-z0-9+.-]*:/i)
    next if target.include?("<") || target.include?(">") || target == "..."

    targets << URI::DEFAULT_PARSER.unescape(target.split(/[?#]/, 2).first)
  end
end

def substantial_windows(content)
  workflow_content = content.lines.reject { |line| line.include?("~/.pipa/communication-style.md") }.join
  workflow_content.downcase.scan(/[[:alnum:]]+/).each_cons(16).map { |words| words.join(" ") }.to_set
end

errors = []
skill_files = Dir.glob(ROOT.join("skills/*/SKILL.md").to_s).map { |path| Pathname(path) }.sort
governed_files = (Dir.glob(ROOT.join("{AGENTS.md,CONTRIBUTING.md,README.md,docs/**/*.md,skills/**/*.md,skills/**/evals/**/*.json,evals/**/*.json}").to_s).reject do |filename|
  Pathname(filename).relative_path_from(ROOT).to_s.start_with?("docs/plans/")
end).map { |filename| Pathname(filename) }.uniq.sort
markdown_files = governed_files.select { |path| path.extname == ".md" }
router_files = ([ROOT.join("skills/pipa/SKILL.md")] + PROMOTIONS.values.map { |owner, _| ROOT.join("skills", owner, "SKILL.md") }).uniq

skill_files.each do |path|
  directory = path.dirname.basename.to_s
  expected = NAME_EXCEPTIONS.fetch(directory, directory)
  data = frontmatter(path)
  actual = data.is_a?(Hash) ? data["name"].to_s : ""
  errors << "#{path.relative_path_from(ROOT)}: frontmatter name '#{actual}' must match directory '#{directory}'" if actual != expected
end

setup_path = ROOT.join("skills/pipa-setup")
communication_style_path = setup_path.join("references/communication-style.md")
if setup_path.exist? && !communication_style_path.exist?
  errors << "skills/pipa-setup/references/communication-style.md: required pipa-setup communication style reference is missing"
end

markdown_files.each do |filename|
  path = Pathname(filename)
  local_link_targets(path.read).each do |target|
    resolved = path.dirname.join(target).cleanpath
    errors << "#{path.relative_path_from(ROOT)}: broken local Markdown link '#{target}'" unless resolved.exist?
  end
end

PROMOTIONS.each do |operation, (owner, stale_path)|
  operation_path = ROOT.join("skills", operation, "SKILL.md")
  owner_path = ROOT.join("skills", owner, "SKILL.md")
  next unless owner_path.exist? || operation_path.exist?

  unless owner_path.exist?
    errors << "skills/#{owner}/SKILL.md: owner lane for #{operation} is missing"
    next
  end

  unless operation_path.exist?
    errors << "skills/#{operation}/SKILL.md: canonical operation is missing"
    next
  end

  errors << "#{stale_path}: promoted workflow source still exists" if ROOT.join(stale_path).exist?

  short_path = stale_path.sub(%r{\Askills/#{Regexp.escape(owner)}/}, "")
  governed_files.each do |path|
    next unless path.exist?
    next if path == operation_path

    content = path.read
    if content.include?(stale_path) || content.include?(short_path)
      errors << "#{path.relative_path_from(ROOT)}: stale promoted path '#{stale_path}'"
    end
  end

  operation_content = operation_path.read
  owner_content = owner_path.read
  unless owner_content.include?(operation)
    errors << "#{owner_path.relative_path_from(ROOT)}: owner lane must name #{operation}"
  end

  operation_data = frontmatter(operation_path)
  expected_description = "Use only when `#{operation}` is explicitly invoked or `#{owner}` delegates to it."
  actual_description = operation_data.is_a?(Hash) ? operation_data["description"].to_s : ""
  unless [expected_description, "#{expected_description} Do not trigger from generic language."].include?(actual_description)
    errors << "#{operation_path.relative_path_from(ROOT)}: operation description must require explicit invocation or #{owner} delegation"
  end

  trigger_path = operation_path.dirname.join("evals/trigger-eval-set.json")
  unless trigger_path.exist?
    errors << "#{trigger_path.relative_path_from(ROOT)}: operation trigger eval is missing"
  else
    trigger_tests = JSON.parse(trigger_path.read)
    positive_tests = trigger_tests.select { |test| test["should_trigger"] }
    explicit_positive = false
    delegation_positive = false
    owner_pattern = Regexp.escape(owner).gsub("\\-", "[- ]")
    positive_tests.each do |test|
      query = test["query"].to_s
      explicit_invocation = query.match?(/\A\s*(?:run|invoke) #{Regexp.escape(operation)}\b/i)
      owner_delegation = query.match?(/\b#{owner_pattern}\b.*\bdelegates this to #{Regexp.escape(operation)}\b/i)
      explicit_positive ||= explicit_invocation
      delegation_positive ||= owner_delegation
      unless explicit_invocation || owner_delegation
        errors << "#{trigger_path.relative_path_from(ROOT)}: positive trigger must invoke #{operation} or delegate from #{owner}"
      end
    end
    errors << "#{trigger_path.relative_path_from(ROOT)}: operation needs an explicit run/invoke positive trigger" unless explicit_positive
    errors << "#{trigger_path.relative_path_from(ROOT)}: operation needs a delegation positive trigger from #{owner}" unless delegation_positive
    unless trigger_tests.any? { |test| !test["should_trigger"] && test["routing_contract"] == "generic-lane-owned" && !test["query"].to_s.include?(operation) }
      errors << "#{trigger_path.relative_path_from(ROOT)}: operation needs a generic lane-owned negative trigger"
    end
  end

  operation_title = operation_content[/^#\s+(.+)$/, 1]
  router_files.each do |router_path|
    next unless router_path.exist?

    router_content = router_path.read
    if operation_title && router_content.match?(/^\#{2,6}\s+#{Regexp.escape(operation_title)}\s*$/)
      errors << "#{router_path.relative_path_from(ROOT)}: inline fallback heading copies #{operation}"
    end

    duplicate = substantial_windows(operation_content) & substantial_windows(router_content)
    errors << "#{router_path.relative_path_from(ROOT)}: inline fallback content copies #{operation}" if duplicate.any?
  end
end


REMOVED_ROUTER_PATHS.each do |stale_path|
  errors << "#{stale_path}: removed router source still exists" if ROOT.join(stale_path).exist?

  short_path = stale_path.sub(%r{\Askills/[^/]+/}, "")
  governed_files.each do |path|
    next unless path.exist?

    content = path.read
    if content.include?(stale_path) || content.include?(short_path)
      errors << "#{path.relative_path_from(ROOT)}: stale removed router path '#{stale_path}'"
    end
  end
end

if errors.any?
  puts "Skill architecture validation failed:\n\n"
  errors.uniq.each { |error| puts "- #{error}" }
  exit 1
end

puts "Validated #{skill_files.length} skill(s): names, local links, promoted paths, and inline fallbacks are valid."
