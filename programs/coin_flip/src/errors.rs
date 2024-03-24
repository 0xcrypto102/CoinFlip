use anchor_lang::error_code;

#[error_code]
pub enum CoinFlipError {
    #[msg("ContestError: Not allowed owner")]
    NotAllowedOwner,

    #[msg("ContestError: Over max bet amont")]
    MaxBetAmount,

    #[msg("ContestError: InvalidAmount")]
    InvalidAmount,

    #[msg("ContestError: Un-initialized Account")]
    UninitializedAccount,

    #[msg("ContestError: already claimed")]
    AlreadyClaimed,

    #[msg("ContestError: Fee unvalid amount")]
    FeeUnVaildAmount
}