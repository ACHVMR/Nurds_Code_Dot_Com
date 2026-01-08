/**
 * Projects Routes for Cloudflare Workers
 * Project CRUD and collaboration
 */

import { Router } from 'itty-router';
import { jsonResponse, successResponse, createdResponse, noContentResponse } from '../utils/responses.js';
import { badRequest, notFound, forbidden } from '../utils/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { getSupabaseClient, getProjects, createProject, hasActiveSubscription } from '../services/supabase.js';

const router = Router({ base: '/api/projects' });

/**
 * GET /api/projects - List all projects
 */
router.get('/', requireAuth(async (request, env, ctx) => {
  const supabase = getSupabaseClient(env);
  const projects = await getProjects(ctx.user.userId, supabase);
  
  return successResponse(projects);
}));

/**
 * GET /api/projects/:id - Get single project
 */
router.get('/:id', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const supabase = getSupabaseClient(env);
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('*, collaborators:project_collaborators(*)')
    .eq('id', id)
    .single();

  if (error || !project) {
    return notFound('Project not found');
  }

  // Check access
  const isOwner = project.user_id === ctx.user.userId;
  const isCollaborator = project.collaborators?.some(c => c.user_id === ctx.user.userId);

  if (!isOwner && !isCollaborator) {
    return forbidden('Access denied');
  }
  
  return successResponse(project);
}));

/**
 * POST /api/projects - Create new project
 */
router.post('/', requireAuth(async (request, env, ctx) => {
  const body = await request.json();
  const { name, description, files, agentId } = body;

  if (!name) {
    return badRequest('Project name is required');
  }

  const supabase = getSupabaseClient(env);

  const project = await createProject({
    user_id: ctx.user.userId,
    name,
    description,
    files: files || {},
    agent_id: agentId,
  }, supabase);

  return createdResponse(project);
}));

/**
 * PUT /api/projects/:id - Update project
 */
router.put('/:id', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const body = await request.json();
  const { name, description, files } = body;

  const supabase = getSupabaseClient(env);
  
  // Verify ownership
  const { data: existing } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== ctx.user.userId) {
    return notFound('Project not found');
  }

  const updates = { updated_at: new Date().toISOString() };
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (files !== undefined) updates.files = files;

  const { data: project, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return badRequest('Failed to update project');
  }

  return successResponse(project);
}));

/**
 * DELETE /api/projects/:id - Delete project
 */
router.delete('/:id', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const supabase = getSupabaseClient(env);
  
  const { data: existing } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing || existing.user_id !== ctx.user.userId) {
    return notFound('Project not found');
  }

  await supabase.from('projects').delete().eq('id', id);

  return noContentResponse();
}));

/**
 * POST /api/projects/:id/files - Save project files
 */
router.post('/:id/files', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const body = await request.json();
  const { files } = body;

  if (!files || typeof files !== 'object') {
    return badRequest('Files object is required');
  }

  const supabase = getSupabaseClient(env);
  
  const { data: project, error } = await supabase
    .from('projects')
    .update({ 
      files, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .eq('user_id', ctx.user.userId)
    .select()
    .single();

  if (error) {
    return badRequest('Failed to save files');
  }

  return successResponse(project);
}));

/**
 * POST /api/projects/:id/collaborators - Add collaborator
 */
router.post('/:id/collaborators', requireAuth(async (request, env, ctx) => {
  const { id } = request.params;
  const body = await request.json();
  const { email, role = 'editor' } = body;

  if (!email) {
    return badRequest('Collaborator email is required');
  }

  const supabase = getSupabaseClient(env);

  // Check if user has Plus One plan for collaboration
  const hasSub = await hasActiveSubscription(ctx.user.userId, supabase);
  if (!hasSub) {
    return forbidden('Upgrade to Plus One plan for collaboration features');
  }

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!project || project.user_id !== ctx.user.userId) {
    return notFound('Project not found');
  }

  // Find collaborator user
  const { data: collaborator } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!collaborator) {
    return badRequest('User not found');
  }

  // Add collaborator
  const { data, error } = await supabase
    .from('project_collaborators')
    .insert({
      project_id: id,
      user_id: collaborator.id,
      role,
    })
    .select()
    .single();

  if (error) {
    return badRequest('Failed to add collaborator');
  }

  return createdResponse(data);
}));

/**
 * DELETE /api/projects/:id/collaborators/:userId - Remove collaborator
 */
router.delete('/:id/collaborators/:userId', requireAuth(async (request, env, ctx) => {
  const { id, userId } = request.params;
  const supabase = getSupabaseClient(env);

  // Verify ownership
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!project || project.user_id !== ctx.user.userId) {
    return notFound('Project not found');
  }

  await supabase
    .from('project_collaborators')
    .delete()
    .eq('project_id', id)
    .eq('user_id', userId);

  return noContentResponse();
}));

export { router as projectsRouter };
