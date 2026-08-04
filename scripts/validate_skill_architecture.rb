#!/usr/bin/env ruby

require "pathname"
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
  content.downcase.scan(/[[:alnum:]]+/).each_cons(16).map { |words| words.join(" ") }.to_set
end

errors = []
skill_files = Dir.glob(ROOT.join("skills/*/SKILL.md").to_s).map { |path| Pathname(path) }.sort
active_files = Dir.glob(ROOT.join("skills/**/*.{md,json}").to_s) +
  Dir.glob(ROOT.join("evals/**/*.json").to_s) + [ROOT.join("README.md").to_s]

skill_files.each do |path|
  directory = path.dirname.basename.to_s
  expected = NAME_EXCEPTIONS.fetch(directory, directory)
  data = frontmatter(path)
  actual = data.is_a?(Hash) ? data["name"].to_s : ""
  errors << "#{path.relative_path_from(ROOT)}: frontmatter name '#{actual}' must match directory '#{directory}'" if actual != expected
end

Dir.glob(ROOT.join("skills/**/*.md").to_s).sort.each do |filename|
  path = Pathname(filename)
  local_link_targets(path.read).each do |target|
    resolved = path.dirname.join(target).cleanpath
    errors << "#{path.relative_path_from(ROOT)}: broken local Markdown link '#{target}'" unless resolved.exist?
  end
end

PROMOTIONS.each do |operation, (owner, stale_path)|
  operation_path = ROOT.join("skills", operation, "SKILL.md")
  owner_path = ROOT.join("skills", owner, "SKILL.md")
  next unless owner_path.exist?

  unless operation_path.exist?
    errors << "skills/#{operation}/SKILL.md: canonical operation is missing"
    next
  end

  errors << "#{stale_path}: promoted workflow source still exists" if ROOT.join(stale_path).exist?

  short_path = stale_path.sub(%r{\Askills/#{Regexp.escape(owner)}/}, "")
  active_files.sort.each do |filename|
    path = Pathname(filename)
    next unless path.exist?
    next if path == operation_path

    content = path.read
    if content.include?(stale_path) || content.include?(short_path)
      errors << "#{path.relative_path_from(ROOT)}: stale promoted path '#{stale_path}'"
    end
  end

  operation_content = operation_path.read
  owner_content = owner_path.read
  operation_title = operation_content[/^#\s+(.+)$/, 1]
  if operation_title && owner_content.match?(/^\#{2,6}\s+#{Regexp.escape(operation_title)}\s*$/)
    errors << "#{owner_path.relative_path_from(ROOT)}: inline fallback heading copies #{operation}"
  end

  duplicate = substantial_windows(operation_content) & substantial_windows(owner_content)
  errors << "#{owner_path.relative_path_from(ROOT)}: inline fallback content copies #{operation}" if duplicate.any?
end


REMOVED_ROUTER_PATHS.each do |stale_path|
  errors << "#{stale_path}: removed router source still exists" if ROOT.join(stale_path).exist?

  short_path = stale_path.sub(%r{\Askills/[^/]+/}, "")
  active_files.sort.each do |filename|
    path = Pathname(filename)
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
