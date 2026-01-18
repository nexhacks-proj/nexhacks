# Git Merge Strategies - Overwrite with Your Version

## Option 1: Use "ours" Strategy (Recommended for keeping YOUR changes)

When merging, always prefer YOUR changes:

```bash
git merge -X ours <branch-name>
```

This will automatically resolve conflicts by keeping YOUR version.

**Example:**
```bash
git pull origin main -X ours
# or
git merge origin/main -X ours
```

## Option 2: Resolve Conflicts Manually (Pick and choose)

If conflicts occur:

```bash
# Start merge/pull
git pull origin main

# If conflicts occur, for EACH conflicted file:
git checkout --ours <file-path>    # Use YOUR version
# OR
git checkout --theirs <file-path>  # Use THEIR version

# Then commit
git add .
git commit -m "Merge resolved - keeping my changes"
git push
```

## Option 3: Always Use Your Version for ALL Files

During an active merge with conflicts:

```bash
# Use YOUR version for all conflicted files
git checkout --ours .

# Stage all changes
git add .

# Complete the merge
git commit -m "Merged - kept my version"
git push
```

## Option 4: Force Overwrite (DANGEROUS - rewrites history)

⚠️ **ONLY if you're the only one working on the branch:**

```bash
# Reset to your version
git reset --hard HEAD

# Force push (rewrites remote history)
git push --force
```

## Option 5: Configure Git to Default to "ours"

Set merge strategy for this repo:

```bash
git config merge.ours.driver true
```

Then during merges, conflicts auto-resolve to your version.

## Quick Reference:

- `-X ours` = Use YOUR changes during merge
- `-X theirs` = Use THEIR changes during merge  
- `--ours` = Use YOUR version of a file
- `--theirs` = Use THEIR version of a file
- `--force` = Overwrite remote (dangerous)

## Most Common Workflow:

```bash
# Pull with your version preference
git pull origin main -X ours

# If still conflicts, use your version for all files
git checkout --ours .
git add .
git commit -m "Merged - kept my changes"
git push
```
