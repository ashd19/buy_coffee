use anchor_lang::prelude::*;

declare_id!("GRAhvAGfjdQK6nMEYbpziQhpmFJhdxtJZWbgN2rC6mpC");

#[program]
pub mod buy_cofee {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
