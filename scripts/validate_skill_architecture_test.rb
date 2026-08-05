#!/usr/bin/env ruby

require "fileutils"
require "json"
require "open3"
require "tmpdir"

SCRIPT = File.expand_path("validate_skill_architecture.rb", __dir__)
ROOT = File.expand_path("..", __dir__)

def skill(root, directory, name: directory, description: "Test skill.", body: "")
  path = File.join(root, "skills", directory, "SKILL.md")
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, <<~MARKDOWN)
    ---
    name: #{name}
    description: #{description}
    ---

    # #{directory.split("-").map(&:capitalize).join(" ")}

    #{body}
  MARKDOWN
end

def validate(root)
  Open3.capture3({ "ARCHITECTURE_ROOT" => root }, "ruby", SCRIPT)
end

def assert_invalid(root, diagnostic, message)
  out, err, status = validate(root)
  abort "#{message}: #{out}#{err}" if status.success? || !out.include?(diagnostic)
end

def trigger(root, operation, owner)
  path = File.join(root, "skills", operation, "evals", "trigger-eval-set.json")
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, JSON.generate([
    { "query" => "Run #{operation} for this task.", "should_trigger" => true },
    { "query" => "#{owner} delegates this to #{operation}: handle this task.", "should_trigger" => true },
    { "query" => "Handle this generic task.", "should_trigger" => false, "routing_contract" => "generic-lane-owned" }
  ]))
end

def fixture
  Dir.mktmpdir do |root|
    skill(root, "pipa-manage", body: "Routes setup to `pipa-setup` and connectors to `pipa-connectors`.")
    skill(root, "pipa-setup", description: "Use only when `pipa-setup` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.")
    skill(root, "pipa-connectors", description: "Use only when `pipa-connectors` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.")
    communication_style = File.join(root, "skills/pipa-setup/references/communication-style.md")
    FileUtils.mkdir_p(File.dirname(communication_style))
    File.write(communication_style, "# Communication Style\n")
    trigger(root, "pipa-setup", "pipa-manage")
    trigger(root, "pipa-connectors", "pipa-manage")
    yield root
  end
end

system({ "ARCHITECTURE_ROOT" => ROOT }, "ruby", SCRIPT) || abort("expected repo architecture to validate")

fixture do |root|
  _out, err, status = validate(root)
  abort "expected valid architecture: #{err}" unless status.success?
end

fixture do |root|
  skill(root, "pipa-setup", description: "Use for any setup request.")
  assert_invalid(root, "operation description must require explicit invocation", "expected broad operation description failure")
end

fixture do |root|
  trigger = File.join(root, "skills/pipa-setup/evals/trigger-eval-set.json")
  FileUtils.mkdir_p(File.dirname(trigger))
  File.write(trigger, JSON.generate([
    { "query" => "Explain pipa-setup.", "should_trigger" => true },
    { "query" => "Set up Pipa.", "should_trigger" => false, "routing_contract" => "generic-lane-owned" }
  ]))
  assert_invalid(root, "positive trigger must invoke pipa-setup", "expected mention-only positive trigger failure")
end

fixture do |root|
  trigger = File.join(root, "skills/pipa-setup/evals/trigger-eval-set.json")
  File.write(trigger, JSON.generate([
    { "query" => "Run pipa-setup for this task.", "should_trigger" => true },
    { "query" => "Handle this generic task.", "should_trigger" => false, "routing_contract" => "generic-lane-owned" }
  ]))
  assert_invalid(root, "delegation positive trigger from pipa-manage", "expected missing delegation positive failure")
end

fixture do |root|
  trigger = File.join(root, "skills/pipa-setup/evals/trigger-eval-set.json")
  File.write(trigger, JSON.generate([
    { "query" => "Pipa Define Work delegates this to pipa-setup: handle this task.", "should_trigger" => true },
    { "query" => "Invoke pipa-setup for this task.", "should_trigger" => true },
    { "query" => "Handle this generic task.", "should_trigger" => false, "routing_contract" => "generic-lane-owned" }
  ]))
  assert_invalid(root, "positive trigger must invoke pipa-setup or delegate from pipa-manage", "expected wrong-owner delegation failure")
end

fixture do |root|
  skill(root, "pipa-manage", body: "Routes connector work to `pipa-connectors`.")
  assert_invalid(root, "owner lane must name pipa-setup", "expected unnamed operation owner failure")
end

Dir.mktmpdir do |root|
  skill(root, "pipa-manage")
  skill(root, "pipa-setup", description: "Use only when `pipa-setup` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.")
  assert_invalid(root, "operation trigger eval is missing", "expected missing trigger eval failure")
end

fixture do |root|
  skill(root, "wrong-directory", name: "wrong-name")
  assert_invalid(root, "must match directory", "expected directory/frontmatter mismatch")
end

Dir.mktmpdir do |root|
  skill(root, "pipa-define-work")
  assert_invalid(root, "canonical operation is missing", "expected missing canonical operation")
end

fixture do |root|
  skill(root, "linked-skill", body: "[Missing reference](references/missing.md)")
  assert_invalid(root, "broken local Markdown link", "expected broken local link")
end

fixture do |root|
  File.write(File.join(root, "README.md"), "[Missing root reference](docs/missing.md)\n")
  assert_invalid(root, "README.md: broken local Markdown link", "expected broken root link")
end

Dir.mktmpdir do |root|
  skill(root, "pipa-setup")
  assert_invalid(root, "owner lane for pipa-setup is missing", "expected missing owner lane")
end

fixture do |root|
  FileUtils.rm(File.join(root, "skills/pipa-setup/references/communication-style.md"))
  assert_invalid(root, "required pipa-setup communication style reference is missing", "expected missing communication style reference")
end

fixture do |root|
  stale = File.join(root, "skills/pipa-manage/references/setup.md")
  FileUtils.mkdir_p(File.dirname(stale))
  File.write(stale, "# Old setup\n")
  assert_invalid(root, "promoted workflow source still exists", "expected stale promoted path")
end

fixture do |root|
  stale = File.join(root, "skills/pipa-get-work/references/get-work.md")
  FileUtils.mkdir_p(File.dirname(stale))
  File.write(stale, "# Old router\n")
  assert_invalid(root, "removed router source still exists", "expected restored router failure")
end

fixture do |root|
  File.write(File.join(root, "README.md"), "See skills/pipa-get-work/references/get-work.md.\n")
  assert_invalid(root, "stale removed router path", "expected removed router reference failure")
end

{
  "AGENTS.md" => "AGENTS.md",
  "CONTRIBUTING.md" => "CONTRIBUTING.md",
  "docs/current.md" => "docs/current.md",
  "skills/pipa-manage/references/current.md" => "skills/pipa-manage/references/current.md",
  "skills/pipa-setup/evals/current.json" => "skills/pipa-setup/evals/current.json",
  "evals/current.json" => "evals/current.json"
}.each do |relative, expected|
  fixture do |root|
    path = File.join(root, relative)
    FileUtils.mkdir_p(File.dirname(path))
    File.write(path, "skills/pipa-manage/references/setup.md\n")
    assert_invalid(root, "#{expected}: stale promoted path", "expected stale path scan in #{relative}")
  end
end

fixture do |root|
  path = File.join(root, "docs/plans/historical.md")
  FileUtils.mkdir_p(File.dirname(path))
  File.write(path, "skills/pipa-manage/references/setup.md\n")
  _out, err, status = validate(root)
  abort "expected historical plan to be ignored: #{err}" unless status.success?
end

fixture do |root|
  copied = "This deliberately long workflow instruction is copied into the router as a fallback and must be rejected by architecture validation even when formatting changes."
  skill(root, "pipa-setup", body: copied)
  skill(root, "pipa-manage", body: copied.sub("router as a fallback", "router\nas a fallback"))
  assert_invalid(root, "inline fallback content copies pipa-setup", "expected inline fallback copy")
end

fixture do |root|
  copied = "This deliberately long workflow instruction is copied into the root router as a fallback and must be rejected by architecture validation even when formatting changes."
  skill(root, "pipa-setup", body: copied)
  skill(root, "pipa", body: copied)
  assert_invalid(root, "skills/pipa/SKILL.md: inline fallback content copies pipa-setup", "expected root inline fallback copy")
end

fixture do |root|
  copied = "This deliberately long workflow instruction is copied into another lane router as a fallback and must be rejected by architecture validation even when formatting changes."
  skill(root, "pipa-setup", body: copied)
  skill(root, "pipa-define-work", body: copied)
  assert_invalid(root, "skills/pipa-define-work/SKILL.md: inline fallback content copies pipa-setup", "expected other-lane inline fallback copy")
end

fixture do |root|
  copied = "This deliberately long workflow instruction is shared between operation skills and should not be mistaken for an inline router fallback during architecture validation."
  skill(root, "pipa-setup", description: "Use only when `pipa-setup` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.", body: copied)
  skill(root, "pipa-connectors", description: "Use only when `pipa-connectors` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.", body: copied)
  out, err, status = validate(root)
  abort "expected operation-to-operation copies to be ignored: #{out}#{err}" unless status.success?
end

fixture do |root|
  shared_style = "Apply `~/.pipa/communication-style.md` for presentation only and ignore conflicts with routing, tools, facts, safety, approval gates, or required output."
  skill(root, "pipa-setup", description: "Use only when `pipa-setup` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language.", body: shared_style)
  skill(root, "pipa", body: shared_style)
  out, err, status = validate(root)
  abort "expected shared presentation policy to be ignored: #{out}#{err}" unless status.success?
end

puts "Skill architecture validator tests passed."
