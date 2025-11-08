/**
 * BOOMER_ANG API ROUTES
 * Backend handlers for AI Agent (Boomer_Ang) CRUD operations, marketplace, and sandbox
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Service role client (bypasses RLS for admin operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * GET /api/boomer-angs/my-agents
 * Get all Boomer_Angs owned by the current user
 */
export async function getMyAgents(request, userId) {
  try {
    // Get user's Boomer_Angs via user_boomer_angs join
    const { data, error } = await supabaseAdmin
      .from('user_agent_collection')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching my agents:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/boomer-angs/premade
 * Get official pre-made Boomer_Angs
 */
export async function getPremadeAgents() {
  try {
    const { data, error } = await supabaseAdmin
      .from('boomer_angs')
      .select('*')
      .eq('is_premade', true)
      .eq('is_public', true)
      .order('rating', { ascending: false });

    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching premade agents:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/boomer-angs/marketplace
 * Get all public Boomer_Angs available for purchase/rent
 */
export async function getMarketplaceAgents(request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const level = url.searchParams.get('level');
    const sortBy = url.searchParams.get('sortBy') || 'rating';

    let query = supabaseAdmin
      .from('marketplace_listings')
      .select('*');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (level && level !== 'all') {
      query = query.eq('effectiveness_level', level);
    }

    // Sorting
    switch (sortBy) {
      case 'popular':
        query = query.order('total_runs', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'price':
        query = query.order('price', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching marketplace agents:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET /api/boomer-angs/sandbox
 * Get Boomer_Angs in user's sandbox
 */
export async function getSandboxAgents(request, userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_agent_collection')
      .select('*')
      .eq('user_id', userId)
      .eq('ownership_type', 'sandbox')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return Response.json(data || []);
  } catch (error) {
    console.error('Error fetching sandbox agents:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/boomer-angs
 * Create a new Boomer_Ang
 */
export async function createBoomerAng(request, userId) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description) {
      return Response.json({ error: 'Name and description required' }, { status: 400 });
    }

    // Create the Boomer_Ang
    const { data: boomerAng, error: createError } = await supabaseAdmin
      .from('boomer_angs')
      .insert({
        name: body.name,
        description: body.description,
        image_url: body.image,
        category: body.category || 'General',
        effectiveness_level: body.effectivenessLevel || 'Basic',
        features: body.features || [],
        tags: body.tags || [],
        config: body.config || {},
        is_public: body.isPublic || false,
        price: body.price || 0,
        rent_price: body.rentPrice || 0,
        creator_id: userId,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add to user's collection
    const { error: ownershipError } = await supabaseAdmin
      .from('user_boomer_angs')
      .insert({
        user_id: userId,
        boomer_ang_id: boomerAng.id,
        ownership_type: 'owned',
        purchased_at: new Date().toISOString(),
      });

    if (ownershipError) throw ownershipError;

    return Response.json(boomerAng, { status: 201 });
  } catch (error) {
    console.error('Error creating Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/boomer-angs/:id
 * Update a Boomer_Ang
 */
export async function updateBoomerAng(request, userId, boomerAngId) {
  try {
    const body = await request.json();

    // Verify ownership
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('boomer_angs')
      .select('creator_id')
      .eq('id', boomerAngId)
      .single();

    if (checkError) throw checkError;
    if (existing.creator_id !== userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update
    const { data, error } = await supabaseAdmin
      .from('boomer_angs')
      .update({
        name: body.name,
        description: body.description,
        image_url: body.image,
        category: body.category,
        effectiveness_level: body.effectivenessLevel,
        features: body.features,
        tags: body.tags,
        config: body.config,
        is_public: body.isPublic,
        price: body.price,
        rent_price: body.rentPrice,
      })
      .eq('id', boomerAngId)
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error updating Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/boomer-angs/:id
 * Delete a Boomer_Ang
 */
export async function deleteBoomerAng(request, userId, boomerAngId) {
  try {
    // Verify ownership
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('boomer_angs')
      .select('creator_id')
      .eq('id', boomerAngId)
      .single();

    if (checkError) throw checkError;
    if (existing.creator_id !== userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete (cascades to user_boomer_angs)
    const { error } = await supabaseAdmin
      .from('boomer_angs')
      .delete()
      .eq('id', boomerAngId);

    if (error) throw error;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/boomer-angs/:id/clone
 * Clone a Boomer_Ang to user's collection
 */
export async function cloneBoomerAng(request, userId, boomerAngId) {
  try {
    // Get original
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('boomer_angs')
      .select('*')
      .eq('id', boomerAngId)
      .single();

    if (fetchError) throw fetchError;

    // Create clone
    const { data: clone, error: createError } = await supabaseAdmin
      .from('boomer_angs')
      .insert({
        name: `${original.name} (Copy)`,
        description: original.description,
        image_url: original.image_url,
        category: original.category,
        effectiveness_level: original.effectiveness_level,
        features: original.features,
        tags: original.tags,
        config: original.config,
        creator_id: userId,
        is_public: false, // Clones are private by default
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add to user's collection
    await supabaseAdmin
      .from('user_boomer_angs')
      .insert({
        user_id: userId,
        boomer_ang_id: clone.id,
        ownership_type: 'owned',
      });

    return Response.json(clone, { status: 201 });
  } catch (error) {
    console.error('Error cloning Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/boomer-angs/:id/purchase
 * Purchase a Boomer_Ang from marketplace
 */
export async function purchaseBoomerAng(request, userId, boomerAngId) {
  try {
    // Get Boomer_Ang details
    const { data: boomerAng, error: fetchError } = await supabaseAdmin
      .from('boomer_angs')
      .select('*, creator_id')
      .eq('id', boomerAngId)
      .single();

    if (fetchError) throw fetchError;

    if (!boomerAng.is_public) {
      return Response.json({ error: 'Agent not available for purchase' }, { status: 400 });
    }

    // Process payment (integrate with Stripe/PayPal)
    // TODO: Implement actual payment processing
    const paymentSuccess = true; // Placeholder

    if (!paymentSuccess) {
      return Response.json({ error: 'Payment failed' }, { status: 402 });
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('marketplace_transactions')
      .insert({
        buyer_id: userId,
        seller_id: boomerAng.creator_id,
        boomer_ang_id: boomerAngId,
        transaction_type: 'purchase',
        amount: boomerAng.price,
        payment_status: 'completed',
      })
      .select()
      .single();

    if (txError) throw txError;

    // Add to user's collection
    const { data: ownership, error: ownershipError } = await supabaseAdmin
      .from('user_boomer_angs')
      .insert({
        user_id: userId,
        boomer_ang_id: boomerAngId,
        ownership_type: 'owned',
        purchase_price: boomerAng.price,
        purchased_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (ownershipError) throw ownershipError;

    return Response.json(ownership, { status: 201 });
  } catch (error) {
    console.error('Error purchasing Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/boomer-angs/:id/rent
 * Rent a Boomer_Ang for 30 days
 */
export async function rentBoomerAng(request, userId, boomerAngId) {
  try {
    const { data: boomerAng, error: fetchError } = await supabaseAdmin
      .from('boomer_angs')
      .select('*, creator_id')
      .eq('id', boomerAngId)
      .single();

    if (fetchError) throw fetchError;

    if (!boomerAng.rent_price || boomerAng.rent_price === 0) {
      return Response.json({ error: 'Agent not available for rent' }, { status: 400 });
    }

    // Process payment
    const paymentSuccess = true; // TODO: Implement payment

    if (!paymentSuccess) {
      return Response.json({ error: 'Payment failed' }, { status: 402 });
    }

    const rentalStart = new Date();
    const rentalEnd = new Date(rentalStart.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create transaction
    await supabaseAdmin
      .from('marketplace_transactions')
      .insert({
        buyer_id: userId,
        seller_id: boomerAng.creator_id,
        boomer_ang_id: boomerAngId,
        transaction_type: 'rental_start',
        amount: boomerAng.rent_price,
        payment_status: 'completed',
        rental_period_days: 30,
      });

    // Add to user's collection as rental
    const { data: rental, error: rentalError } = await supabaseAdmin
      .from('user_boomer_angs')
      .insert({
        user_id: userId,
        boomer_ang_id: boomerAngId,
        ownership_type: 'rented',
        rental_start: rentalStart.toISOString(),
        rental_end: rentalEnd.toISOString(),
        rental_active: true,
      })
      .select()
      .single();

    if (rentalError) throw rentalError;

    return Response.json(rental, { status: 201 });
  } catch (error) {
    console.error('Error renting Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/boomer-angs/sandbox/add
 * Add a Boomer_Ang to sandbox for testing
 */
export async function addToSandbox(request, userId) {
  try {
    const { boomerAngId } = await request.json();

    // Create sandbox session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('sandbox_sessions')
      .insert({
        user_id: userId,
        boomer_ang_id: boomerAngId,
        session_name: 'Test Session',
        max_runs: 100,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Add to user_boomer_angs as sandbox
    const { data: sandboxEntry, error: entryError } = await supabaseAdmin
      .from('user_boomer_angs')
      .insert({
        user_id: userId,
        boomer_ang_id: boomerAngId,
        ownership_type: 'sandbox',
      })
      .select()
      .single();

    if (entryError) throw entryError;

    return Response.json(sandboxEntry, { status: 201 });
  } catch (error) {
    console.error('Error adding to sandbox:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/boomer-angs/:id/deploy
 * Start/stop a Boomer_Ang
 */
export async function deployBoomerAng(request, userId, boomerAngId) {
  try {
    const { isRunning } = await request.json();

    // Update status
    const { data, error } = await supabaseAdmin
      .from('boomer_angs')
      .update({
        status: isRunning ? 'running' : 'stopped',
      })
      .eq('id', boomerAngId)
      .eq('creator_id', userId) // Ensure ownership
      .select()
      .single();

    if (error) throw error;

    return Response.json(data);
  } catch (error) {
    console.error('Error deploying Boomer_Ang:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/upload
 * Upload image to R2 storage
 */
export async function uploadImage(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type') || 'boomer-ang-image';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Upload to Cloudflare R2 (or your storage solution)
    // TODO: Implement actual R2 upload
    const mockUrl = `https://storage.example.com/${type}/${Date.now()}-${file.name}`;

    return Response.json({ url: mockUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
