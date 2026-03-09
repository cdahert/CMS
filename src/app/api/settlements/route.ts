import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/integrations/supabase/server";

interface SettlementRequest {
  commerce_id: string;
  period_start: string;
  period_end: string;
  gross_sales: number;
  shipping_cost: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SettlementRequest;

    // Validate required fields
    const { commerce_id, period_start, period_end, gross_sales, shipping_cost } =
      body;

    if (
      !commerce_id ||
      !period_start ||
      !period_end ||
      gross_sales == null ||
      shipping_cost == null
    ) {
      return NextResponse.json(
        {
          error:
            "Campos requeridos: commerce_id, period_start, period_end, gross_sales, shipping_cost",
        },
        { status: 400 }
      );
    }

    const supabase = await createServiceRoleClient();

    // 1. Get commerce plan
    const { data: commerce, error: commerceError } = await supabase
      .from("commerces")
      .select("id, plan")
      .eq("id", commerce_id)
      .single();

    if (commerceError || !commerce) {
      return NextResponse.json(
        { error: "Comercio no encontrado" },
        { status: 404 }
      );
    }

    // 2. Get commission matrix for commerce plan
    const { data: matrix, error: matrixError } = await supabase
      .from("commission_matrix")
      .select("*")
      .eq("plan", commerce.plan)
      .single();

    if (matrixError || !matrix) {
      return NextResponse.json(
        { error: "Matriz de comisiones no encontrada para el plan" },
        { status: 404 }
      );
    }

    // 3. Calculate commission
    const commissionInitial = matrix.commission_initial;
    const growthDiscount = matrix.growth_discount;
    const managementDiscount = matrix.management_discount;
    const communicationDiscount = matrix.communication_discount;

    // Final commission rate = initial rate minus all discounts (clamped to 0 minimum)
    const finalCommissionRate = Math.max(
      0,
      commissionInitial -
        growthDiscount -
        managementDiscount -
        communicationDiscount
    );

    // Commission amount = gross sales * final commission rate
    const commissionAmount = gross_sales * finalCommissionRate;

    // Net payable = gross sales - commission - shipping cost
    const netPayable = gross_sales - commissionAmount - shipping_cost;

    // 4. Insert settlement
    const { data: settlement, error: insertError } = await supabase
      .from("settlements")
      .insert({
        commerce_id,
        period_start,
        period_end,
        gross_sales,
        commission_rate: commissionInitial,
        growth_discount: growthDiscount,
        management_discount: managementDiscount,
        communication_discount: communicationDiscount,
        final_commission_rate: finalCommissionRate,
        commission_amount: commissionAmount,
        shipping_cost,
        net_payable: netPayable,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting settlement:", insertError);
      return NextResponse.json(
        { error: "Error al crear la liquidación" },
        { status: 500 }
      );
    }

    return NextResponse.json(settlement, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in settlements API:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
