"""
AutoInstaller - Autonomous Tool Installation for Circuit Box
Implements ACP Integration Directive autonomous tool management
"""
import subprocess
import json
import yaml
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path


class AutoInstaller:
    """
    Autonomous tool installer for Circuit Box
    Searches npm/PyPI/GitHub/Docker Hub and installs missing tools without HITL
    """
    
    def __init__(self, circuit_box_registry: str = "circuit-box/breakers.yaml", dry_run: bool = False):
        self.registry_path = Path(circuit_box_registry)
        self.dry_run = dry_run
        self.tier_mapping = {
            'infrastructure': 'tier-1-base',
            'database': 'tier-2-storage',
            'api': 'tier-3-api',
            'integration': 'tier-4-integration',
            'tool': 'tier-5-foundry',
            'agent': 'tier-6-orchestration',
            'ui': 'tier-7-interface',
            'monitoring': 'tier-8-observability'
        }
    
    async def find_and_install(self, tool_name: str, category: str = 'tool') -> Dict[str, Any]:
        """
        Search and install missing tool autonomously
        
        Args:
            tool_name: Name of the tool to install
            category: Tool category for tier classification
            
        Returns:
            Installation result with status and metadata
        """
        print(f"[AutoInstaller] Searching for tool: {tool_name}")
        
        # Search multiple sources
        sources = ['npm', 'pypi', 'github', 'docker']
        search_results = await self.search_tool(tool_name, sources)
        
        if not search_results:
            return {
                "installed": False,
                "error": f"Tool '{tool_name}' not found in any source",
                "tool": tool_name
            }
        
        # Install via appropriate package manager
        try:
            if self.dry_run:
                print(f"[AutoInstaller] DRY RUN: Would install {search_results['package']} from {search_results['type']}")
                return {
                    "installed": True,
                    "dry_run": True,
                    "tool": tool_name,
                    "tier": self.classify_tier(category),
                    "source": search_results['type'],
                    "package": search_results['package']
                }
            
            install_result = await self._install_package(search_results)
            
            if not install_result.get('success'):
                return {
                    "installed": False,
                    "error": install_result.get('error'),
                    "tool": tool_name
                }
            
            # Register in Circuit Box
            tier = self.classify_tier(category)
            await self.register_service(
                name=tool_name,
                tier=tier,
                status="on",
                metadata=search_results
            )
            
            print(f"[AutoInstaller] ✅ Installed {tool_name} to {tier}")
            
            return {
                "installed": True,
                "tool": tool_name,
                "tier": tier,
                "source": search_results['type'],
                "package": search_results['package']
            }
            
        except Exception as e:
            return {
                "installed": False,
                "error": str(e),
                "tool": tool_name
            }
    
    async def search_tool(self, tool_name: str, sources: List[str]) -> Optional[Dict[str, Any]]:
        """
        Search for tool across multiple package managers and repositories
        
        Args:
            tool_name: Tool to search for
            sources: List of sources to search (npm, pypi, github, docker)
            
        Returns:
            Search result with package info or None
        """
        # Try npm first
        if 'npm' in sources:
            npm_result = await self._search_npm(tool_name)
            if npm_result:
                return {
                    'type': 'npm',
                    'package': npm_result['name'],
                    'version': npm_result.get('version', 'latest')
                }
        
        # Try PyPI
        if 'pypi' in sources:
            pypi_result = await self._search_pypi(tool_name)
            if pypi_result:
                return {
                    'type': 'pypi',
                    'package': pypi_result['name'],
                    'version': pypi_result.get('version', 'latest')
                }
        
        # Try GitHub
        if 'github' in sources:
            github_result = await self._search_github(tool_name)
            if github_result:
                return {
                    'type': 'github',
                    'package': github_result['full_name'],
                    'url': github_result['clone_url']
                }
        
        # Try Docker Hub
        if 'docker' in sources:
            docker_result = await self._search_docker(tool_name)
            if docker_result:
                return {
                    'type': 'docker',
                    'image': docker_result['name'],
                    'tag': docker_result.get('tag', 'latest')
                }
        
        return None
    
    async def _install_package(self, package_info: Dict[str, Any]) -> Dict[str, Any]:
        """Install package based on type"""
        try:
            if package_info['type'] == 'npm':
                result = subprocess.run(
                    ['npm', 'install', '-g', package_info['package']],
                    capture_output=True,
                    text=True,
                    check=True
                )
                return {'success': True, 'output': result.stdout}
                
            elif package_info['type'] == 'pypi':
                result = subprocess.run(
                    ['pip', 'install', package_info['package']],
                    capture_output=True,
                    text=True,
                    check=True
                )
                return {'success': True, 'output': result.stdout}
                
            elif package_info['type'] == 'docker':
                image = f"{package_info['image']}:{package_info['tag']}"
                result = subprocess.run(
                    ['docker', 'pull', image],
                    capture_output=True,
                    text=True,
                    check=True
                )
                return {'success': True, 'output': result.stdout}
                
            elif package_info['type'] == 'github':
                # Clone repository
                result = subprocess.run(
                    ['git', 'clone', package_info['url']],
                    capture_output=True,
                    text=True,
                    check=True
                )
                return {'success': True, 'output': result.stdout}
                
            return {'success': False, 'error': 'Unknown package type'}
            
        except subprocess.CalledProcessError as e:
            return {'success': False, 'error': e.stderr}
    
    async def register_service(
        self,
        name: str,
        tier: str,
        status: str,
        metadata: Dict[str, Any]
    ) -> None:
        """
        Register service in Circuit Box registry (breakers.yaml)
        
        Args:
            name: Service name
            tier: Circuit Box tier (tier-1-base through tier-8-observability)
            status: Service status (on/off)
            metadata: Additional service metadata
        """
        # Load existing registry
        if self.registry_path.exists():
            with open(self.registry_path, 'r') as f:
                registry = yaml.safe_load(f) or {}
        else:
            registry = {}
        
        # Ensure tier exists
        if tier not in registry:
            registry[tier] = {}
        
        # Register service
        registry[tier][name] = {
            'status': status,
            'type': metadata.get('type'),
            'package': metadata.get('package'),
            'installed_at': asyncio.get_event_loop().time()
        }
        
        # Write back to registry
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.registry_path, 'w') as f:
            yaml.dump(registry, f, default_flow_style=False)
    
    def classify_tier(self, category: str) -> str:
        """
        Classify tool into appropriate Circuit Box tier
        
        Args:
            category: Tool category
            
        Returns:
            Circuit Box tier identifier
        """
        return self.tier_mapping.get(category, 'tier-5-foundry')
    
    async def _search_npm(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Search npm registry"""
        try:
            result = subprocess.run(
                ['npm', 'search', tool_name, '--json'],
                capture_output=True,
                text=True,
                check=True,
                timeout=30
            )
            packages = json.loads(result.stdout)
            if packages and len(packages) > 0:
                # Return the best match (first result)
                return {
                    'name': packages[0].get('name'),
                    'version': packages[0].get('version', 'latest'),
                    'description': packages[0].get('description', '')
                }
            return None
        except FileNotFoundError:
            print("[AutoInstaller] npm not found in PATH, skipping npm search")
            return None
        except (subprocess.CalledProcessError, json.JSONDecodeError, IndexError, subprocess.TimeoutExpired) as e:
            print(f"[AutoInstaller] npm search failed: {e}")
            return None
    
    async def _search_pypi(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Search PyPI registry via JSON API"""
        try:
            import urllib.request
            import urllib.error
            
            # PyPI JSON API endpoint
            url = f"https://pypi.org/pypi/{tool_name}/json"
            
            with urllib.request.urlopen(url, timeout=10) as response:
                data = json.loads(response.read().decode())
                
                return {
                    'name': data['info']['name'],
                    'version': data['info']['version'],
                    'description': data['info'].get('summary', '')
                }
                
        except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, KeyError):
            # If exact match fails, try PyPI search API
            try:
                search_url = f"https://pypi.org/search/?q={tool_name}"
                # Note: PyPI doesn't have a public search API, so we'd need to scrape or use exact names
                # For now, return None if exact match fails
                return None
            except:
                return None
    
    async def _search_github(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Search GitHub repositories via API"""
        try:
            import urllib.request
            import urllib.error
            
            # GitHub Search API (no auth required for basic search)
            url = f"https://api.github.com/search/repositories?q={tool_name}&sort=stars&order=desc&per_page=1"
            
            req = urllib.request.Request(url)
            req.add_header('Accept', 'application/vnd.github.v3+json')
            req.add_header('User-Agent', 'AutoInstaller/1.0')
            
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                
                if data.get('items') and len(data['items']) > 0:
                    repo = data['items'][0]
                    return {
                        'full_name': repo['full_name'],
                        'clone_url': repo['clone_url'],
                        'description': repo.get('description', ''),
                        'stars': repo.get('stargazers_count', 0)
                    }
                
                return None
                
        except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, KeyError):
            return None
    
    async def _search_docker(self, tool_name: str) -> Optional[Dict[str, Any]]:
        """Search Docker Hub"""
        try:
            import urllib.request
            import urllib.error
            
            # Docker Hub Search API
            url = f"https://hub.docker.com/v2/search/repositories/?query={tool_name}&page_size=1"
            
            req = urllib.request.Request(url)
            req.add_header('Accept', 'application/json')
            
            with urllib.request.urlopen(req, timeout=10) as response:
                data = json.loads(response.read().decode())
                
                if data.get('results') and len(data['results']) > 0:
                    image = data['results'][0]
                    return {
                        'name': image['repo_name'],
                        'tag': 'latest',
                        'description': image.get('short_description', ''),
                        'stars': image.get('star_count', 0)
                    }
                
                return None
                
        except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, KeyError):
            return None


# Example usage
if __name__ == "__main__":
    async def main():
        # Test with dry run first
        print("=== DRY RUN MODE ===")
        installer_dry = AutoInstaller(dry_run=True)
        
        # Test npm search
        npm_result = await installer_dry.find_and_install("stripe", category="integration")
        print("\nNPM Test (Stripe):")
        print(json.dumps(npm_result, indent=2))
        
        # Test PyPI search
        pypi_result = await installer_dry.find_and_install("requests", category="tool")
        print("\nPyPI Test (requests):")
        print(json.dumps(pypi_result, indent=2))
        
        # Test GitHub search
        github_result = await installer_dry.find_and_install("playwright", category="tool")
        print("\nGitHub Test (playwright):")
        print(json.dumps(github_result, indent=2))
        
        # Test Docker search
        docker_result = await installer_dry.find_and_install("postgres", category="database")
        print("\nDocker Test (postgres):")
        print(json.dumps(docker_result, indent=2))
        
        print("\n=== LIVE INSTALL (commented out for safety) ===")
        # Uncomment to actually install (requires confirmation)
        # installer_live = AutoInstaller(dry_run=False)
        # live_result = await installer_live.find_and_install("stripe", category="integration")
        # print(json.dumps(live_result, indent=2))
    
    asyncio.run(main())
