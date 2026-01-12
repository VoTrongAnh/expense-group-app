// frontend/src/pages/SettlementPage.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Avatar, Button, Card, Stack, Paper, Divider } from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';

export default function SettlementPage() {
    const { id: groupId } = useParams();
    const navigate = useNavigate();
    const [settlements, setSettlements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paidStatus, setPaidStatus] = useState({});

    useEffect(() => {
        const fetchSettlements = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/groups/${groupId}/summary`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (res.ok && Array.isArray(data)) {
                    setSettlements(data);
                } else {
                    setError(data.msg || "Không thể tải dữ liệu thanh toán.");
                    setSettlements([]);
                }
            } catch (err) {
                console.error('Lỗi tải dữ liệu thanh toán:', err);
                setError("Lỗi kết nối đến server.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettlements();
    }, [groupId]);

    // ✅ BƯỚC 1: Sửa lại hàm để nó có thể ĐẢO NGƯỢC trạng thái
    const handleTogglePaidStatus = (index) => {
        setPaidStatus(prevStatus => ({
            ...prevStatus,
            [index]: !prevStatus[index] // Đảo ngược: true -> false, và false -> true
        }));
    };

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" color="error">Đã xảy ra lỗi</Typography>
                <Typography>{error}</Typography>
                <Button onClick={() => navigate(`/group/${groupId}`)}>Quay lại</Button>
            </Box>
        )
    }

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ display: 'flex', alignItems: 'center', p: 1, backgroundColor: 'white' }}>
                <IconButton onClick={() => navigate(`/group/${groupId}`)}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>Thanh toán</Typography>
            </Paper>

            {/* Content */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                {isLoading ? (
                    <Typography>Đang tính toán...</Typography>
                ) : settlements.length === 0 ? (
                    <Typography textAlign="center" mt={4}>Tất cả chi tiêu đã được cân bằng! 👍</Typography>
                ) : (
                    <Stack spacing={2}>
                        {settlements.map((item, index) => {
                            const isPaid = paidStatus[index];

                            return (
                                <Card key={index} sx={{ borderRadius: 4, p: 2, transition: 'opacity 0.3s', opacity: isPaid ? 0.6 : 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', mb: 2 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">Người trả</Typography>
                                            <Avatar sx={{ mx: 'auto', my: 1 }}>{item.from?.name?.[0]?.toUpperCase()}</Avatar>
                                            <Typography fontWeight="500">{item.from?.name || 'Không rõ'}</Typography>
                                        </Box>
                                        <ArrowForward color="primary" />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">Người nhận</Typography>
                                            <Avatar sx={{ mx: 'auto', my: 1 }}>{item.to?.name?.[0]?.toUpperCase()}</Avatar>
                                            <Typography fontWeight="500">{item.to?.name || 'Không rõ'}</Typography>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <Typography variant="caption">Số tiền cần thanh toán</Typography>
                                        <Typography variant="h5" fontWeight="bold" color="primary">
                                            {item.amount.toLocaleString('vi-VN')} đ
                                        </Typography>
                                    </Box>
                                    
                                    {/* ✅ BƯỚC 2: Cập nhật lại nút */}
                                    <Button 
                                        variant={isPaid ? "contained" : "outlined"} 
                                        fullWidth 
                                        sx={{ borderRadius: 3, textTransform: 'none' }}
                                        onClick={() => handleTogglePaidStatus(index)} // Gọi hàm mới
                                        // Bỏ thuộc tính disabled để có thể nhấn lại
                                        startIcon={isPaid ? <CheckCircle /> : <RadioButtonUnchecked />}
                                        color={isPaid ? "success" : "primary"}
                                    >
                                        {isPaid ? "Đã thanh toán (Nhấn để hủy)" : "Đánh dấu đã trả"}
                                    </Button>
                                </Card>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}